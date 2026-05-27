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
