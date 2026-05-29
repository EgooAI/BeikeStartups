package service

import (
	"errors"

	"github.com/EgooAI/BeikeStartups/middleware"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/repository"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Username string
	Email    string
	Password string
	Nickname string
	Phone    string
}

type LoginInput struct {
	Username string
	Password string
}

func RegisterUser(input RegisterInput) (*model.User, string, error) {
	if input.Username == "" || input.Email == "" || input.Password == "" {
		return nil, "", errors.New("缺少必要的注册信息")
	}

	if _, err := repository.FindUserByUsernameOrEmail(input.Username, input.Email); err == nil {
		return nil, "", errors.New("用户名或邮箱已存在")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	user := &model.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
		Nickname: input.Nickname,
		Phone:    input.Phone,
		Role:     model.RoleStudent,
		IsActive: true,
	}

	if err := repository.CreateUser(user); err != nil {
		return nil, "", err
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func LoginUser(input LoginInput) (*model.User, string, error) {
	if input.Username == "" || input.Password == "" {
		return nil, "", errors.New("用户名和密码不能为空")
	}

	user, err := repository.FindUserByUsername(input.Username)
	if err != nil {
		return nil, "", errors.New("用户名或密码错误")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, "", errors.New("用户名或密码错误")
	}

	if !user.IsActive {
		return nil, "", errors.New("账户已被禁用")
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

type RoleRequestInput struct {
	RequestedRole   model.UserRole `json:"requested_role"`
	Organization    string         `json:"organization"`
	Expertise       string         `json:"expertise"`
	InvestmentFocus string         `json:"investment_focus"`
	ServiceArea     string         `json:"service_area"`
	ApplicationNote string         `json:"application_note"`
}

func RequestUserRole(user *model.User, input RoleRequestInput) (*model.User, error) {
	if user.Role == model.RoleAdmin {
		return nil, errors.New("管理员无需申请角色")
	}

	if input.RequestedRole != model.RoleMentor && input.RequestedRole != model.RoleInvestor && input.RequestedRole != model.RolePartner {
		return nil, errors.New("不支持的角色申请")
	}

	if user.Role == input.RequestedRole {
		return nil, errors.New("当前角色已为该角色，无需重复申请")
	}

	if user.RoleStatus == model.UserStatusPending {
		return nil, errors.New("已有待审核的角色申请，请等待处理")
	}

	// 如果之前申请被拒绝，允许重新申请
	if user.RoleStatus == model.UserStatusRejected {
		user.RoleStatus = model.UserStatusApproved
	}

	user.RequestedRole = input.RequestedRole
	user.RoleStatus = model.UserStatusPending
	user.Organization = input.Organization
	user.Expertise = input.Expertise
	user.InvestmentFocus = input.InvestmentFocus
	user.ServiceArea = input.ServiceArea
	user.ApplicationNote = input.ApplicationNote

	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func ListRoleRequests() ([]model.User, error) {
	return repository.ListPendingRoleRequests()
}

func ApproveRoleRequest(userID uint) (*model.User, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, err
	}

	if user.RequestedRole == "" || user.RoleStatus != model.UserStatusPending {
		return nil, errors.New("无待审核的角色申请")
	}

	user.Role = user.RequestedRole
	user.RequestedRole = ""
	user.RoleStatus = model.UserStatusApproved

	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func RejectRoleRequest(userID uint) (*model.User, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, err
	}

	if user.RequestedRole == "" || user.RoleStatus != model.UserStatusPending {
		return nil, errors.New("无待审核的角色申请")
	}

	user.RequestedRole = ""
	user.RoleStatus = model.UserStatusRejected

	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func AdminListUsers(role model.UserRole, status model.UserStatus, active *bool) ([]model.User, error) {
	return repository.ListUsers(role, status, active)
}

func SetUserActiveStatus(userID uint, active bool) (*model.User, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, err
	}

	user.IsActive = active
	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func UpdateUserRole(userID uint, role model.UserRole) (*model.User, error) {
	if role == "" {
		return nil, errors.New("角色不能为空")
	}

	if role != model.RoleStudent && role != model.RoleMentor && role != model.RoleInvestor && role != model.RolePartner && role != model.RoleAdmin && role != model.RoleSuperAdmin {
		return nil, errors.New("无效的角色类型")
	}

	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, err
	}

	// Prevent modifying super_admin accounts
	if user.Role == model.RoleSuperAdmin {
		return nil, errors.New("无法修改超级管理员账号")
	}

	user.Role = role
	if role == model.RoleStudent {
		user.RoleStatus = model.UserStatusApproved
		user.RequestedRole = ""
	}

	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func ListApprovedUsersByRole(role model.UserRole) ([]model.User, error) {
	return repository.ListApprovedUsersByRole(role)
}

func GetUserByID(id uint) (*model.User, error) {
	return repository.FindUserByID(id)
}

func ListAdminUsers() ([]model.User, error) {
	var admins []model.User
	adminUsers, err := repository.ListApprovedUsersByRole(model.RoleAdmin)
	if err != nil {
		return nil, err
	}
	admins = append(admins, adminUsers...)

	superAdminUsers, err := repository.ListApprovedUsersByRole(model.RoleSuperAdmin)
	if err != nil {
		return nil, err
	}
	admins = append(admins, superAdminUsers...)

	return admins, nil
}

func PromoteToAdmin(userID uint) (*model.User, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, err
	}

	if user.Role == model.RoleAdmin || user.Role == model.RoleSuperAdmin {
		return nil, errors.New("该用户已经是管理员")
	}

	user.Role = model.RoleAdmin
	user.RoleStatus = model.UserStatusApproved
	user.RequestedRole = ""

	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func DemoteAdmin(userID uint, currentUserID uint) (*model.User, error) {
	if userID == currentUserID {
		return nil, errors.New("不能撤销自己的管理员权限")
	}

	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, err
	}

	if user.Role != model.RoleAdmin {
		return nil, errors.New("该用户不是管理员")
	}

	user.Role = model.RoleStudent
	user.RoleStatus = model.UserStatusApproved

	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func ResetRoleRequestStatus(userID uint) (*model.User, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, err
	}

	// 重置角色申请状态，允许用户重新申请
	user.RequestedRole = ""
	user.RoleStatus = model.UserStatusApproved
	user.Organization = ""
	user.Expertise = ""
	user.InvestmentFocus = ""
	user.ServiceArea = ""
	user.ApplicationNote = ""

	if err := repository.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func DeleteUser(userID uint) error {
	return repository.DeleteUser(userID)
}

func ChangePassword(userID uint, oldPassword, newPassword string) error {
	if oldPassword == "" || newPassword == "" {
		return errors.New("旧密码和新密码不能为空")
	}

	if len(newPassword) < 6 {
		return errors.New("新密码长度至少为6位")
	}

	user, err := repository.FindUserByID(userID)
	if err != nil {
		return errors.New("用户不存在")
	}

	// 验证旧密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return errors.New("旧密码错误")
	}

	// 生成新密码哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("密码加密失败")
	}

	user.Password = string(hashedPassword)
	if err := repository.UpdateUser(user); err != nil {
		return errors.New("密码更新失败")
	}

	return nil
}
