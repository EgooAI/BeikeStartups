package repository

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
)

func FindUserByUsernameOrEmail(username, email string) (*model.User, error) {
	var user model.User
	if err := database.DB.Where("username = ? OR email = ?", username, email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func FindUserByUsername(username string) (*model.User, error) {
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func FindUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateUser(user *model.User) error {
	return database.DB.Create(user).Error
}

func UpdateUser(user *model.User) error {
	return database.DB.Save(user).Error
}

func ListPendingRoleRequests() ([]model.User, error) {
	var users []model.User
	if err := database.DB.Where("role_status = ? AND requested_role <> ''", model.UserStatusPending).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func ListApprovedUsersByRole(role model.UserRole) ([]model.User, error) {
	var users []model.User
	query := database.DB.Where("role_status = ?", model.UserStatusApproved)
	if role != "" {
		query = query.Where("role = ?", role)
	}
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func ListUsers(role model.UserRole, status model.UserStatus, active *bool) ([]model.User, error) {
	var users []model.User
	query := database.DB.Model(&model.User{})

	if role != "" {
		query = query.Where("role = ?", role)
	}
	if status != "" {
		query = query.Where("role_status = ?", status)
	}
	if active != nil {
		query = query.Where("is_active = ?", *active)
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

func DeleteRoleRequest(requestID uint) error {
	return database.DB.Model(&model.User{}).Where("id = ?", requestID).Updates(map[string]interface{}{
		"requested_role": "",
		"role_status":    model.UserStatusRejected,
	}).Error
}

func DeleteUser(userID uint) error {
	// 删除所有关联记录
	// 注意：删除顺序很重要，需要先删除依赖其他表的记录

	// 1. team_member_invitations (InvitedUserID 和 InviterID)
	if err := database.DB.Exec("DELETE FROM team_member_invitations WHERE invited_user_id = ? OR inviter_id = ?", userID, userID).Error; err != nil {
		return err
	}

	// 2. team_join_requests
	if err := database.DB.Exec("DELETE FROM team_join_requests WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 3. startup_applications
	if err := database.DB.Exec("DELETE FROM startup_applications WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 4. recruitment_responses
	if err := database.DB.Exec("DELETE FROM recruitment_responses WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 5. recruitments 通过团队关联删除，在后面处理团队时一起删除

	// 6. resource_opportunities
	if err := database.DB.Exec("DELETE FROM resource_opportunities WHERE owner_id = ?", userID).Error; err != nil {
		return err
	}

	// 7. project_favorites
	if err := database.DB.Exec("DELETE FROM project_favorites WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 8. project_bp_requests
	if err := database.DB.Exec("DELETE FROM project_bp_requests WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 9. project_connection_requests
	if err := database.DB.Exec("DELETE FROM project_connection_requests WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 10. project_mentors
	if err := database.DB.Exec("DELETE FROM project_mentors WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 11. project_investors
	if err := database.DB.Exec("DELETE FROM project_investors WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 12. project_partners
	if err := database.DB.Exec("DELETE FROM project_partners WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 13. event_signups
	if err := database.DB.Exec("DELETE FROM event_signups WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 14. events
	if err := database.DB.Exec("DELETE FROM events WHERE owner_id = ?", userID).Error; err != nil {
		return err
	}

	// 15. team_members
	if err := database.DB.Exec("DELETE FROM team_members WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 16. projects (需要在删除teams之前删除，因为projects引用teams)
	if err := database.DB.Exec("DELETE FROM projects WHERE user_id = ?", userID).Error; err != nil {
		return err
	}

	// 17. 删除用户拥有的团队及其关联数据
	// 先获取用户拥有的团队ID
	var teamIDs []uint
	if err := database.DB.Model(&model.Team{}).Where("owner_id = ?", userID).Pluck("id", &teamIDs).Error; err != nil {
		return err
	}

	if len(teamIDs) > 0 {
		// 先删除团队关联的 projects 的关联数据
		if err := database.DB.Exec("DELETE FROM project_favorites WHERE project_id IN (SELECT id FROM projects WHERE team_id IN (?))", teamIDs).Error; err != nil {
			return err
		}
		if err := database.DB.Exec("DELETE FROM project_mentors WHERE project_id IN (SELECT id FROM projects WHERE team_id IN (?))", teamIDs).Error; err != nil {
			return err
		}
		if err := database.DB.Exec("DELETE FROM project_investors WHERE project_id IN (SELECT id FROM projects WHERE team_id IN (?))", teamIDs).Error; err != nil {
			return err
		}
		if err := database.DB.Exec("DELETE FROM project_partners WHERE project_id IN (SELECT id FROM projects WHERE team_id IN (?))", teamIDs).Error; err != nil {
			return err
		}
		if err := database.DB.Exec("DELETE FROM project_bp_requests WHERE project_id IN (SELECT id FROM projects WHERE team_id IN (?))", teamIDs).Error; err != nil {
			return err
		}
		if err := database.DB.Exec("DELETE FROM project_connection_requests WHERE project_id IN (SELECT id FROM projects WHERE team_id IN (?))", teamIDs).Error; err != nil {
			return err
		}
		// 删除团队关联的projects
		if err := database.DB.Exec("DELETE FROM projects WHERE team_id IN (?)", teamIDs).Error; err != nil {
			return err
		}
		// 删除团队关联的recruitments
		if err := database.DB.Exec("DELETE FROM recruitments WHERE team_id IN (?)", teamIDs).Error; err != nil {
			return err
		}
		// 删除团队关联的team_members
		if err := database.DB.Exec("DELETE FROM team_members WHERE team_id IN (?)", teamIDs).Error; err != nil {
			return err
		}
		// 删除团队关联的team_member_invitations
		if err := database.DB.Exec("DELETE FROM team_member_invitations WHERE team_id IN (?)", teamIDs).Error; err != nil {
			return err
		}
		// 删除团队关联的team_join_requests
		if err := database.DB.Exec("DELETE FROM team_join_requests WHERE team_id IN (?)", teamIDs).Error; err != nil {
			return err
		}
		// 最后删除团队
		if err := database.DB.Exec("DELETE FROM teams WHERE owner_id = ?", userID).Error; err != nil {
			return err
		}
	}

	// 最后删除用户（硬删除）
	return database.DB.Unscoped().Delete(&model.User{}, userID).Error
}
