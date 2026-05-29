package repository

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
)

func CreateTeam(team *model.Team) error {
	return database.DB.Create(team).Error
}

func GetTeamByID(id uint) (*model.Team, error) {
	var team model.Team
	if err := database.DB.Preload("Owner").Preload("Members").First(&team, id).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

func GetTeamByOwnerID(ownerID uint) (*model.Team, error) {
	var team model.Team
	if err := database.DB.Where("owner_id = ?", ownerID).First(&team).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

func ListTeams(status string) ([]model.Team, error) {
	var teams []model.Team
	query := database.DB.Preload("Owner")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Find(&teams).Error; err != nil {
		return nil, err
	}
	return teams, nil
}

func UpdateTeam(team *model.Team) error {
	return database.DB.Save(team).Error
}

func DeleteTeam(team *model.Team) error {
	teamID := team.ID
	ownerID := team.OwnerID

	// 1. 将团队成员的 role 变更为 student
	if err := database.DB.Model(&model.User{}).Where("id IN (SELECT user_id FROM team_members WHERE team_id = ?)", teamID).Update("role", model.RoleStudent).Error; err != nil {
		return err
	}

	// 1.1 将团队负责人的 role 也变更为 student
	if err := database.DB.Model(&model.User{}).Where("id = ?", ownerID).Update("role", model.RoleStudent).Error; err != nil {
		return err
	}

	// 2. 先删除 recruitment_responses（必须在删除 recruitments 之前）
	if err := database.DB.Exec("DELETE FROM recruitment_responses WHERE recruitment_id IN (SELECT id FROM recruitments WHERE team_id = ?)", teamID).Error; err != nil {
		return err
	}

	// 3. 删除团队关联的 recruitments
	if err := database.DB.Exec("DELETE FROM recruitments WHERE team_id = ?", teamID).Error; err != nil {
		return err
	}

	// 4. 先删除 projects 的关联数据，再删除 projects
	// 4.1 删除 project_favorites
	if err := database.DB.Exec("DELETE FROM project_favorites WHERE project_id IN (SELECT id FROM projects WHERE team_id = ?)", teamID).Error; err != nil {
		return err
	}

	// 4.2 删除 project_mentors
	if err := database.DB.Exec("DELETE FROM project_mentors WHERE project_id IN (SELECT id FROM projects WHERE team_id = ?)", teamID).Error; err != nil {
		return err
	}

	// 4.3 删除 project_investors
	if err := database.DB.Exec("DELETE FROM project_investors WHERE project_id IN (SELECT id FROM projects WHERE team_id = ?)", teamID).Error; err != nil {
		return err
	}

	// 4.4 删除 project_partners
	if err := database.DB.Exec("DELETE FROM project_partners WHERE project_id IN (SELECT id FROM projects WHERE team_id = ?)", teamID).Error; err != nil {
		return err
	}

	// 4.5 删除 project_bp_requests
	if err := database.DB.Exec("DELETE FROM project_bp_requests WHERE project_id IN (SELECT id FROM projects WHERE team_id = ?)", teamID).Error; err != nil {
		return err
	}

	// 4.6 删除 project_connection_requests
	if err := database.DB.Exec("DELETE FROM project_connection_requests WHERE project_id IN (SELECT id FROM projects WHERE team_id = ?)", teamID).Error; err != nil {
		return err
	}

	// 4.7 删除 projects
	if err := database.DB.Exec("DELETE FROM projects WHERE team_id = ?", teamID).Error; err != nil {
		return err
	}

	// 5. 删除团队关联的 team_member_invitations
	if err := database.DB.Exec("DELETE FROM team_member_invitations WHERE team_id = ?", teamID).Error; err != nil {
		return err
	}

	// 6. 删除团队关联的 team_join_requests
	if err := database.DB.Exec("DELETE FROM team_join_requests WHERE team_id = ?", teamID).Error; err != nil {
		return err
	}

	// 7. 删除团队关联的 team_members
	if err := database.DB.Exec("DELETE FROM team_members WHERE team_id = ?", teamID).Error; err != nil {
		return err
	}

	// 8. 最后删除团队
	return database.DB.Delete(team).Error
}

func AddTeamMember(teamID uint, userID uint) error {
	var team model.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		return err
	}

	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return err
	}

	isMember, err := IsUserTeamMember(teamID, userID)
	if err != nil {
		return err
	}
	if isMember {
		return nil
	}

	return database.DB.Model(&team).Association("Members").Append(&user)
}

func RemoveTeamMember(teamID uint, userID uint) error {
	var team model.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		return err
	}

	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return err
	}

	return database.DB.Model(&team).Association("Members").Delete(&user)
}

func ListTeamMembers(teamID uint) ([]model.User, error) {
	var team model.Team
	if err := database.DB.Preload("Members").First(&team, teamID).Error; err != nil {
		return nil, err
	}
	return team.Members, nil
}

func IsUserTeamMember(teamID uint, userID uint) (bool, error) {
	var count int64
	err := database.DB.Table("team_members").Where("team_id = ? AND user_id = ?", teamID, userID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func CreateTeamInvitation(teamID uint, invitedUserID uint, inviterID uint) (*model.TeamMemberInvitation, error) {
	invitation := &model.TeamMemberInvitation{
		TeamID:        teamID,
		InvitedUserID: invitedUserID,
		InviterID:     inviterID,
		Status:        model.TeamInvitationStatusPending,
	}
	if err := database.DB.Create(invitation).Error; err != nil {
		return nil, err
	}
	return invitation, nil
}

func GetTeamInvitationByID(id uint) (*model.TeamMemberInvitation, error) {
	var inv model.TeamMemberInvitation
	if err := database.DB.Preload("Team").Preload("InvitedUser").Preload("Inviter").First(&inv, id).Error; err != nil {
		return nil, err
	}
	return &inv, nil
}

func ListTeamInvitations(teamID uint) ([]model.TeamMemberInvitation, error) {
	var invitations []model.TeamMemberInvitation
	if err := database.DB.Preload("InvitedUser").Preload("Inviter").Where("team_id = ?", teamID).Find(&invitations).Error; err != nil {
		return nil, err
	}
	return invitations, nil
}

func UpdateTeamInvitation(invitation *model.TeamMemberInvitation) error {
	return database.DB.Save(invitation).Error
}

func UpdateTeamJoinRequest(request *model.TeamJoinRequest) error {
	return database.DB.Save(request).Error
}

func CreateTeamJoinRequest(teamID uint, userID uint) (*model.TeamJoinRequest, error) {
	request := &model.TeamJoinRequest{
		TeamID: teamID,
		UserID: userID,
		Status: model.TeamJoinRequestStatusPending,
	}
	if err := database.DB.Create(request).Error; err != nil {
		return nil, err
	}
	return request, nil
}

func GetTeamJoinRequestByID(id uint) (*model.TeamJoinRequest, error) {
	var req model.TeamJoinRequest
	if err := database.DB.Preload("Team").Preload("User").First(&req, id).Error; err != nil {
		return nil, err
	}
	return &req, nil
}

func ListTeamJoinRequests(teamID uint) ([]model.TeamJoinRequest, error) {
	var requests []model.TeamJoinRequest
	if err := database.DB.Preload("User").Where("team_id = ?", teamID).Find(&requests).Error; err != nil {
		return nil, err
	}
	return requests, nil
}

func HasPendingTeamInvitation(teamID uint, userID uint) (bool, error) {
	var count int64
	err := database.DB.Model(&model.TeamMemberInvitation{}).
		Where("team_id = ? AND invited_user_id = ? AND status = ?", teamID, userID, model.TeamInvitationStatusPending).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func HasPendingJoinRequest(teamID uint, userID uint) (bool, error) {
	var count int64
	err := database.DB.Model(&model.TeamJoinRequest{}).
		Where("team_id = ? AND user_id = ? AND status = ?", teamID, userID, model.TeamJoinRequestStatusPending).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func TransferTeamOwnership(teamID uint, newOwnerID uint) error {
	team, err := GetTeamByID(teamID)
	if err != nil {
		return err
	}
	if team.OwnerID == newOwnerID {
		return nil
	}
	team.OwnerID = newOwnerID
	return UpdateTeam(team)
}
