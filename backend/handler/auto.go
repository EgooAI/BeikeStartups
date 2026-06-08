package handler

import (
	"fmt"

	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/repository"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/EgooAI/BeikeStartups/service"
	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=1,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname" binding:"omitempty,max=50"`
	Phone    string `json:"phone"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user, token, err := service.RegisterUser(service.RegisterInput{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
		Nickname: req.Nickname,
		Phone:    req.Phone,
	})
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	user, token, err := service.LoginUser(service.LoginInput{
		Username: req.Username,
		Password: req.Password,
	})
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

func GetCurrentUser(c *gin.Context) {
	user := c.MustGet("user").(*model.User)
	response.Success(c, user)
}

type UpdateCurrentUserRequest struct {
	Nickname *string `json:"nickname"`
	Avatar   *string `json:"avatar"`
	Phone    *string `json:"phone"`
	Email    *string `json:"email"`
}

func UpdateCurrentUser(c *gin.Context) {
	var req UpdateCurrentUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)

	if req.Nickname != nil {
		user.Nickname = *req.Nickname
	}
	if req.Avatar != nil {
		user.Avatar = *req.Avatar
	}
	if req.Phone != nil {
		user.Phone = *req.Phone
	}
	if req.Email != nil {
		// check uniqueness
		if existing, err := repository.FindUserByUsernameOrEmail("", *req.Email); err == nil && existing.ID != user.ID {
			response.BadRequest(c, "邮箱已被使用")
			return
		}
		user.Email = *req.Email
	}

	if err := repository.UpdateUser(user); err != nil {
		response.InternalError(c, "更新用户失败")
		return
	}

	response.Success(c, user)
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

func ChangePassword(c *gin.Context) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)
	if err := service.ChangePassword(user.ID, req.OldPassword, req.NewPassword); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.SuccessWithMessage(c, "密码修改成功", nil)
}

type RoleRequestRequest struct {
	RequestedRole   model.UserRole `json:"requested_role" binding:"required,oneof=mentor investor partner"`
	Organization    string         `json:"organization"`
	Expertise       string         `json:"expertise"`
	InvestmentFocus string         `json:"investment_focus"`
	ServiceArea     string         `json:"service_area"`
	ApplicationNote string         `json:"application_note"`
}

type ReviewRoleRequestRequest struct {
	Note string `json:"note"`
}

func RequestUserRole(c *gin.Context) {
	var req RoleRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)
	updated, err := service.RequestUserRole(user, service.RoleRequestInput{
		RequestedRole:   req.RequestedRole,
		Organization:    req.Organization,
		Expertise:       req.Expertise,
		InvestmentFocus: req.InvestmentFocus,
		ServiceArea:     req.ServiceArea,
		ApplicationNote: req.ApplicationNote,
	})
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, updated)
}

func ListRoleRequests(c *gin.Context) {
	requests, err := service.ListRoleRequests()
	if err != nil {
		response.InternalError(c, "获取角色申请列表失败")
		return
	}

	response.Success(c, requests)
}

func ApproveRoleRequest(c *gin.Context) {
	id := c.Param("id")
	var userID uint
	_, _ = fmt.Sscan(id, &userID)

	updated, err := service.ApproveRoleRequest(userID)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, updated)
}

func RejectRoleRequest(c *gin.Context) {
	id := c.Param("id")
	var userID uint
	_, _ = fmt.Sscan(id, &userID)

	updated, err := service.RejectRoleRequest(userID)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, updated)
}

func DeleteRoleRequest(c *gin.Context) {
	id := c.Param("id")
	var requestID uint
	_, _ = fmt.Sscan(id, &requestID)

	if err := service.DeleteRoleRequest(requestID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "删除成功"})
}

func ListUsers(c *gin.Context) {
	role := model.UserRole(c.Query("role"))
	users, err := service.ListApprovedUsersByRole(role)
	if err != nil {
		response.InternalError(c, "获取用户列表失败")
		return
	}

	response.Success(c, users)
}

type AdminUpdateUserActiveStatusRequest struct {
	Active bool `json:"active"`
}

type AdminUpdateUserRoleRequest struct {
	Role model.UserRole `json:"role" binding:"required,oneof=student mentor investor partner admin super_admin"`
}

func AdminListUsers(c *gin.Context) {
	role := model.UserRole(c.Query("role"))
	status := model.UserStatus(c.Query("status"))

	var active *bool
	if a := c.Query("is_active"); a != "" {
		value := a == "true"
		active = &value
	}

	users, err := service.AdminListUsers(role, status, active)
	if err != nil {
		response.InternalError(c, "获取用户列表失败")
		return
	}

	response.Success(c, users)
}

func AdminUpdateUserActiveStatus(c *gin.Context) {
	id := c.Param("id")
	var userID uint
	_, _ = fmt.Sscan(id, &userID)

	var req AdminUpdateUserActiveStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user, err := service.SetUserActiveStatus(userID, req.Active)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, user)
}

func AdminUpdateUserRole(c *gin.Context) {
	id := c.Param("id")
	var userID uint
	_, _ = fmt.Sscan(id, &userID)

	var req AdminUpdateUserRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user, err := service.UpdateUserRole(userID, req.Role)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, user)
}

func GetUser(c *gin.Context) {
	id := c.Param("id")
	var userID uint
	_, _ = fmt.Sscan(id, &userID)

	user, err := service.GetUserByID(userID)
	if err != nil {
		response.NotFound(c, "用户不存在")
		return
	}

	response.Success(c, user)
}

func AdminListAll(c *gin.Context) {
	admins, err := service.ListAdminUsers()
	if err != nil {
		response.InternalError(c, "获取管理员列表失败")
		return
	}

	response.Success(c, admins)
}

func AdminPromote(c *gin.Context) {
	var req struct {
		UserID uint `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user, err := service.PromoteToAdmin(req.UserID)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, user)
}

func AdminDemote(c *gin.Context) {
	var req struct {
		UserID uint `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	currentUser := c.MustGet("user").(*model.User)
	user, err := service.DemoteAdmin(req.UserID, currentUser.ID)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, user)
}

func AdminResetRoleRequest(c *gin.Context) {
	id := c.Param("id")
	var userID uint
	_, _ = fmt.Sscan(id, &userID)

	user, err := service.ResetRoleRequestStatus(userID)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.SuccessWithMessage(c, "角色申请状态已重置，用户可重新申请", user)
}

func DeleteUserAccount(c *gin.Context) {
	user := c.MustGet("user").(*model.User)

	if user.Role == model.RoleAdmin || user.Role == model.RoleSuperAdmin {
		response.Forbidden(c, "管理员账号不能自行注销")
		return
	}

	if err := service.DeleteUser(user.ID); err != nil {
		response.InternalError(c, "注销失败")
		return
	}

	response.SuccessWithMessage(c, "账号已成功注销", nil)
}
