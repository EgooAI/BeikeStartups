package handler

import (
	"fmt"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/repository"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/EgooAI/BeikeStartups/service"
	"github.com/gin-gonic/gin"
)

type CreateTeamRequest struct {
	Name        string `json:"name" binding:"required,max=100"`
	Description string `json:"description"`
	Logo        string `json:"logo"`
}

type UpdateTeamRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Logo        *string `json:"logo"`
}

type ReviewTeamRequest struct {
	Note string `json:"note"`
}

func CreateTeam(c *gin.Context) {
	var req CreateTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)
	team, err := service.CreatePendingTeam(user, req.Name, req.Description, req.Logo)
	if err != nil {
		response.Forbidden(c, err.Error())
		return
	}

	response.Success(c, team)
}

func GetTeam(c *gin.Context) {
	id := c.Param("id")
	team, err := repository.GetTeamByID(parseUintParam(id))
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	response.Success(c, team)
}

func UpdateTeam(c *gin.Context) {
	id := c.Param("id")
	var req UpdateTeamRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	team, err := repository.GetTeamByID(parseUintParam(id))
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	if req.Name != nil {
		team.Name = *req.Name
	}
	if req.Description != nil {
		team.Description = *req.Description
	}
	if req.Logo != nil {
		team.Logo = *req.Logo
	}

	if err := repository.UpdateTeam(team); err != nil {
		response.InternalError(c, "更新团队失败")
		return
	}

	response.Success(c, team)
}

func DeleteTeam(c *gin.Context) {
	id := c.Param("id")
	team, err := repository.GetTeamByID(parseUintParam(id))
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	if err := repository.DeleteTeam(team); err != nil {
		response.InternalError(c, "删除团队失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func ListTeams(c *gin.Context) {
	// pagination
	page := 1
	limit := 20
	if p := c.Query("page"); p != "" {
		fmt.Sscan(p, &page)
	}
	if l := c.Query("limit"); l != "" {
		fmt.Sscan(l, &limit)
	}

	status := c.Query("status")
	var teams []model.Team
	query := database.DB.Preload("Owner")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	if err := query.Model(&model.Team{}).Count(&total).Error; err != nil {
		response.InternalError(c, "获取团队总数失败")
		return
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&teams).Error; err != nil {
		response.InternalError(c, "获取团队列表失败")
		return
	}

	response.Success(c, gin.H{"items": teams, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}

func ApproveTeam(c *gin.Context) {
	id := c.Param("id")
	var req ReviewTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	user := c.MustGet("user").(*model.User)
	team, err := service.ApproveTeam(parseUintParam(id), user, req.Note)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}

	response.Success(c, team)
}

func RejectTeam(c *gin.Context) {
	id := c.Param("id")
	var req ReviewTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	user := c.MustGet("user").(*model.User)
	team, err := service.RejectTeam(parseUintParam(id), user, req.Note)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}

	response.Success(c, team)
}

type AddMemberRequest struct {
	UserID uint `json:"user_id" binding:"required"`
}

func ListTeamMembers(c *gin.Context) {
	id := c.Param("id")
	members, err := repository.ListTeamMembers(parseUintParam(id))
	if err != nil {
		response.NotFound(c, "团队不存在或无法列出成员")
		return
	}
	response.Success(c, members)
}

func AddTeamMember(c *gin.Context) {
	id := c.Param("id")
	var req AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	operator := c.MustGet("user").(*model.User)
	team, err := repository.GetTeamByID(parseUintParam(id))
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	// only owner or admin can add members
	if operator.Role != model.RoleAdmin && operator.ID != team.OwnerID {
		response.Forbidden(c, "只有团队拥有者或管理员可以添加成员")
		return
	}

	if err := repository.AddTeamMember(team.ID, req.UserID); err != nil {
		response.InternalError(c, "添加成员失败: "+err.Error())
		return
	}

	response.SuccessWithMessage(c, "成员已添加", nil)
}

func RemoveTeamMember(c *gin.Context) {
	id := c.Param("id")
	userIDParam := c.Param("user_id")
	teamID := parseUintParam(id)
	userID := parseUintParam(userIDParam)

	operator := c.MustGet("user").(*model.User)
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	// only owner or admin can remove members
	if operator.Role != model.RoleAdmin && operator.ID != team.OwnerID && operator.ID != userID {
		response.Forbidden(c, "只有团队拥有者、管理员或本人可以移除成员")
		return
	}

	if err := repository.RemoveTeamMember(teamID, userID); err != nil {
		response.InternalError(c, "移除成员失败: "+err.Error())
		return
	}

	response.SuccessWithMessage(c, "成员已移除", nil)
}

type InviteMemberRequest struct {
	UserID uint `json:"user_id" binding:"required"`
}

type TransferOwnerRequest struct {
	NewOwnerID uint `json:"new_owner_id" binding:"required"`
}

func ListTeamInvitations(c *gin.Context) {
	teamID := parseUintParam(c.Param("id"))
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	operator := c.MustGet("user").(*model.User)
	if operator.Role != model.RoleAdmin && operator.ID != team.OwnerID {
		response.Forbidden(c, "只有团队拥有者或管理员可以查看邀请")
		return
	}

	invitations, err := repository.ListTeamInvitations(teamID)
	if err != nil {
		response.InternalError(c, "获取邀请列表失败")
		return
	}

	response.Success(c, invitations)
}

func InviteTeamMember(c *gin.Context) {
	teamID := parseUintParam(c.Param("id"))
	var req InviteMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	operator := c.MustGet("user").(*model.User)
	invitation, err := service.InviteTeamMember(teamID, req.UserID, operator)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, invitation)
}

func AcceptTeamInvitation(c *gin.Context) {
	inviteID := parseUintParam(c.Param("invite_id"))
	operator := c.MustGet("user").(*model.User)
	invitation, err := service.ApproveTeamInvitation(inviteID, operator)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, invitation)
}

func RejectTeamInvitation(c *gin.Context) {
	inviteID := parseUintParam(c.Param("invite_id"))
	operator := c.MustGet("user").(*model.User)
	invitation, err := service.RejectTeamInvitation(inviteID, operator)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, invitation)
}

func RequestTeamJoin(c *gin.Context) {
	teamID := parseUintParam(c.Param("id"))
	user := c.MustGet("user").(*model.User)
	request, err := service.RequestJoinTeam(teamID, user)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, request)
}

func ListTeamJoinRequests(c *gin.Context) {
	teamID := parseUintParam(c.Param("id"))
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	operator := c.MustGet("user").(*model.User)
	if operator.Role != model.RoleAdmin && operator.ID != team.OwnerID {
		response.Forbidden(c, "只有团队拥有者或管理员可以查看加入申请")
		return
	}

	requests, err := repository.ListTeamJoinRequests(teamID)
	if err != nil {
		response.InternalError(c, "获取加入申请失败")
		return
	}

	response.Success(c, requests)
}

func ApproveTeamJoinRequest(c *gin.Context) {
	requestID := parseUintParam(c.Param("request_id"))
	operator := c.MustGet("user").(*model.User)
	request, err := service.ApproveTeamJoinRequest(requestID, operator)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, request)
}

func RejectTeamJoinRequest(c *gin.Context) {
	requestID := parseUintParam(c.Param("request_id"))
	operator := c.MustGet("user").(*model.User)
	request, err := service.RejectTeamJoinRequest(requestID, operator)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, request)
}

func TransferTeamOwnership(c *gin.Context) {
	teamID := parseUintParam(c.Param("id"))
	var req TransferOwnerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	operator := c.MustGet("user").(*model.User)
	team, err := service.TransferTeamOwnership(teamID, req.NewOwnerID, operator)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, team)
}

func JoinTeam(c *gin.Context) {
	id := c.Param("id")
	teamID := parseUintParam(id)
	user := c.MustGet("user").(*model.User)

	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	if team.Status != model.TeamStatusApproved {
		response.Forbidden(c, "团队尚未通过审批，无法加入")
		return
	}

	// add self
	if err := repository.AddTeamMember(teamID, user.ID); err != nil {
		response.InternalError(c, "加入团队失败: "+err.Error())
		return
	}

	response.SuccessWithMessage(c, "已加入团队", nil)
}

func LeaveTeam(c *gin.Context) {
	id := c.Param("id")
	teamID := parseUintParam(id)
	user := c.MustGet("user").(*model.User)

	// owner cannot leave (must transfer or delete)
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	if team.OwnerID == user.ID {
		response.Forbidden(c, "团队拥有者不能直接退出，请先转移所有权或删除团队")
		return
	}

	if err := repository.RemoveTeamMember(teamID, user.ID); err != nil {
		response.InternalError(c, "退出团队失败: "+err.Error())
		return
	}

	response.SuccessWithMessage(c, "已退出团队", nil)
}

func parseUintParam(param string) uint {
	var id uint
	_, _ = fmt.Sscan(param, &id)
	return id
}
