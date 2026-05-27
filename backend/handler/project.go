package handler

import (
	"fmt"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/repository"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

type CreateProjectRequest struct {
	Title       string `json:"title" binding:"required,max=200"`
	Description string `json:"description" binding:"required"`
	Content     string `json:"content"`
	CoverImage  string `json:"cover_image"`
	IsPublic    bool   `json:"is_public"`
	Tags        string `json:"tags"`
}

type UpdateProjectRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Content     *string `json:"content"`
	CoverImage  *string `json:"cover_image"`
	IsPublic    *bool   `json:"is_public"`
	Tags        *string `json:"tags"`
}

func CreateProject(c *gin.Context) {
	var req CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)

	team, err := repository.GetTeamByOwnerID(user.ID)
	if err != nil {
		response.Forbidden(c, "需要先创建团队")
		return
	}
	if team.Status != model.TeamStatusApproved {
		response.Forbidden(c, "团队认证未通过，无法发布项目")
		return
	}

	project := model.Project{
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		CoverImage:  req.CoverImage,
		Status:      model.ProjStatusDraft,
		IsPublic:    req.IsPublic,
		TeamID:      team.ID,
		Tags:        req.Tags,
	}

	if err := database.DB.Create(&project).Error; err != nil {
		response.InternalError(c, "创建项目失败")
		return
	}

	response.Success(c, project)
}

func GetProject(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.Preload("Team").First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if project.Status != model.ProjStatusOnline && user == nil {
		response.Forbidden(c, "项目未上架，无法查看")
		return
	}

	if project.Status != model.ProjStatusOnline && user != nil {
		var team model.Team
		if err := database.DB.First(&team, project.TeamID).Error; err == nil && team.OwnerID != user.ID && user.Role != model.RoleAdmin {
			response.Forbidden(c, "无权查看此项目")
			return
		}
	}

	project.ViewCount++
	database.DB.Save(&project)

	response.Success(c, project)
}

func UpdateProject(c *gin.Context) {
	id := c.Param("id")
	var req UpdateProjectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var project model.Project
	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权修改此项目")
		return
	}

	if project.Status != model.ProjStatusDraft && project.Status != model.ProjStatusRejectedOnline && project.Status != model.ProjStatusRejectedOffline {
		response.BadRequest(c, "当前状态不允许修改")
		return
	}

	if req.Title != nil {
		project.Title = *req.Title
	}
	if req.Description != nil {
		project.Description = *req.Description
	}
	if req.Content != nil {
		project.Content = *req.Content
	}
	if req.CoverImage != nil {
		project.CoverImage = *req.CoverImage
	}
	if req.IsPublic != nil {
		project.IsPublic = *req.IsPublic
	}
	if req.Tags != nil {
		project.Tags = *req.Tags
	}

	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "更新项目失败")
		return
	}

	response.Success(c, project)
}

func DeleteProject(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权删除此项目")
		return
	}

	if err := database.DB.Delete(&project).Error; err != nil {
		response.InternalError(c, "删除项目失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func ListProjects(c *gin.Context) {
	// pagination
	page := 1
	limit := 20
	if p := c.Query("page"); p != "" {
		fmt.Sscan(p, &page)
	}
	if l := c.Query("limit"); l != "" {
		fmt.Sscan(l, &limit)
	}

	var projects []model.Project
	query := database.DB.Preload("Team")

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	} else {
		query = query.Where("status = ?", model.ProjStatusOnline)
	}

	isPublic := c.Query("is_public")
	if isPublic == "true" {
		query = query.Where("is_public = ?", true)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	if err := query.Model(&model.Project{}).Count(&total).Error; err != nil {
		response.InternalError(c, "获取项目总数失败")
		return
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&projects).Error; err != nil {
		response.InternalError(c, "获取项目列表失败")
		return
	}

	response.Success(c, gin.H{"items": projects, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}

func FavoriteProject(c *gin.Context) {
	projectID := c.Param("id")
	var project model.Project
	if err := database.DB.First(&project, projectID).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	favorite := model.ProjectFavorite{
		UserID:    user.ID,
		ProjectID: project.ID,
	}

	if err := database.DB.Where("user_id = ? AND project_id = ?", user.ID, project.ID).First(&model.ProjectFavorite{}).Error; err == nil {
		response.BadRequest(c, "已收藏该项目")
		return
	}

	if err := database.DB.Create(&favorite).Error; err != nil {
		response.InternalError(c, "收藏项目失败")
		return
	}

	response.Success(c, favorite)
}

func UnfavoriteProject(c *gin.Context) {
	projectID := c.Param("id")
	user := c.MustGet("user").(*model.User)

	if err := database.DB.Where("user_id = ? AND project_id = ?", user.ID, projectID).Delete(&model.ProjectFavorite{}).Error; err != nil {
		response.InternalError(c, "取消收藏失败")
		return
	}

	response.SuccessWithMessage(c, "已取消收藏", nil)
}

func ListFavoriteProjects(c *gin.Context) {
	user := c.MustGet("user").(*model.User)
	var favorites []model.ProjectFavorite
	if err := database.DB.Preload("Project").Where("user_id = ?", user.ID).Find(&favorites).Error; err != nil {
		response.InternalError(c, "获取收藏项目失败")
		return
	}

	response.Success(c, favorites)
}

type RequestProjectBPRequest struct {
	Message string `json:"message" binding:"required"`
}

func RequestProjectBP(c *gin.Context) {
	projectID := c.Param("id")
	var project model.Project
	if err := database.DB.First(&project, projectID).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err == nil && team.OwnerID == user.ID {
		response.BadRequest(c, "团队成员无需申请BP权限")
		return
	}

	var req RequestProjectBPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	bpRequest := model.ProjectBPRequest{
		ProjectID:  project.ID,
		UserID:     user.ID,
		Status:     model.RequestStatusPending,
		ReviewNote: req.Message,
	}

	if err := database.DB.Create(&bpRequest).Error; err != nil {
		response.InternalError(c, "申请 BP 权限失败")
		return
	}

	response.Success(c, bpRequest)
}

func ListProjectBPRequests(c *gin.Context) {
	projectID := c.Param("id")
	var project model.Project
	if err := database.DB.First(&project, projectID).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权查看 BP 请求")
		return
	}

	var requests []model.ProjectBPRequest
	if err := database.DB.Preload("User").Where("project_id = ?", project.ID).Find(&requests).Error; err != nil {
		response.InternalError(c, "获取 BP 请求失败")
		return
	}

	response.Success(c, requests)
}

func ApproveProjectBPRequest(c *gin.Context) {
	requestID := c.Param("request_id")
	var bpRequest model.ProjectBPRequest
	if err := database.DB.Preload("Project").First(&bpRequest, requestID).Error; err != nil {
		response.NotFound(c, "BP 请求不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, bpRequest.Project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权审批 BP 请求")
		return
	}

	if bpRequest.Status != model.RequestStatusPending {
		response.BadRequest(c, "只能审批待处理的 BP 请求")
		return
	}

	bpRequest.Status = model.RequestStatusAccepted
	if err := database.DB.Save(&bpRequest).Error; err != nil {
		response.InternalError(c, "审批 BP 请求失败")
		return
	}

	response.SuccessWithMessage(c, "BP 请求已批准", bpRequest)
}

func RejectProjectBPRequest(c *gin.Context) {
	requestID := c.Param("request_id")
	var bpRequest model.ProjectBPRequest
	if err := database.DB.Preload("Project").First(&bpRequest, requestID).Error; err != nil {
		response.NotFound(c, "BP 请求不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, bpRequest.Project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权审批 BP 请求")
		return
	}

	if bpRequest.Status != model.RequestStatusPending {
		response.BadRequest(c, "只能审批待处理的 BP 请求")
		return
	}

	bpRequest.Status = model.RequestStatusRejected
	if err := database.DB.Save(&bpRequest).Error; err != nil {
		response.InternalError(c, "驳回 BP 请求失败")
		return
	}

	response.SuccessWithMessage(c, "BP 请求已拒绝", bpRequest)
}

type ConnectionRequestInput struct {
	Message string `json:"message" binding:"required"`
}

func CreateProjectConnectionRequest(c *gin.Context) {
	projectID := c.Param("id")
	var project model.Project
	if err := database.DB.First(&project, projectID).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err == nil && team.OwnerID == user.ID {
		response.BadRequest(c, "团队无法对自己项目发起对接申请")
		return
	}

	var req ConnectionRequestInput
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	connReq := model.ProjectConnectionRequest{
		ProjectID: project.ID,
		UserID:    user.ID,
		Message:   req.Message,
		Status:    model.RequestStatusPending,
	}

	if err := database.DB.Create(&connReq).Error; err != nil {
		response.InternalError(c, "创建对接申请失败")
		return
	}

	response.Success(c, connReq)
}

func ListProjectConnectionRequests(c *gin.Context) {
	projectID := c.Param("id")
	var project model.Project
	if err := database.DB.First(&project, projectID).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权查看对接申请")
		return
	}

	var requests []model.ProjectConnectionRequest
	if err := database.DB.Preload("User").Where("project_id = ?", project.ID).Find(&requests).Error; err != nil {
		response.InternalError(c, "获取对接申请失败")
		return
	}

	response.Success(c, requests)
}

func AcceptProjectConnectionRequest(c *gin.Context) {
	requestID := c.Param("request_id")
	var connReq model.ProjectConnectionRequest
	if err := database.DB.Preload("Project").First(&connReq, requestID).Error; err != nil {
		response.NotFound(c, "对接申请不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, connReq.Project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权审批对接申请")
		return
	}

	if connReq.Status != model.RequestStatusPending {
		response.BadRequest(c, "只能审批待处理的对接申请")
		return
	}

	connReq.Status = model.RequestStatusAccepted
	if err := database.DB.Save(&connReq).Error; err != nil {
		response.InternalError(c, "审批对接申请失败")
		return
	}

	response.SuccessWithMessage(c, "对接申请已接受", connReq)
}

func RejectProjectConnectionRequest(c *gin.Context) {
	requestID := c.Param("request_id")
	var connReq model.ProjectConnectionRequest
	if err := database.DB.Preload("Project").First(&connReq, requestID).Error; err != nil {
		response.NotFound(c, "对接申请不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, connReq.Project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权审批对接申请")
		return
	}

	if connReq.Status != model.RequestStatusPending {
		response.BadRequest(c, "只能审批待处理的对接申请")
		return
	}

	connReq.Status = model.RequestStatusRejected
	if err := database.DB.Save(&connReq).Error; err != nil {
		response.InternalError(c, "驳回对接申请失败")
		return
	}

	response.SuccessWithMessage(c, "对接申请已拒绝", connReq)
}

func RequestProjectOnline(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err != nil || team.OwnerID != user.ID {
		response.Forbidden(c, "无权执行此操作")
		return
	}

	if project.Status != model.ProjStatusDraft {
		response.BadRequest(c, "只能申请草稿状态的项目上架")
		return
	}

	project.Status = model.ProjStatusPendingOnline
	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "申请上架失败")
		return
	}

	response.SuccessWithMessage(c, "已提交上架申请", project)
}

func ApproveProjectOnline(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	if project.Status != model.ProjStatusPendingOnline {
		response.BadRequest(c, "只能审批待上架状态的项目")
		return
	}

	project.Status = model.ProjStatusOnline
	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "已批准上架", project)
}

func RejectProjectOnline(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	if project.Status != model.ProjStatusPendingOnline {
		response.BadRequest(c, "只能审批待上架状态的项目")
		return
	}

	project.Status = model.ProjStatusRejectedOnline
	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "已拒绝上架", project)
}

func RequestProjectOffline(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err != nil || team.OwnerID != user.ID {
		response.Forbidden(c, "无权执行此操作")
		return
	}

	if project.Status != model.ProjStatusOnline {
		response.BadRequest(c, "只能申请已上架的项目下架")
		return
	}

	project.Status = model.ProjStatusPendingOffline
	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "申请下架失败")
		return
	}

	response.SuccessWithMessage(c, "已提交下架申请", project)
}

func ApproveProjectOffline(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	if project.Status != model.ProjStatusPendingOffline {
		response.BadRequest(c, "只能审批待下架状态的项目")
		return
	}

	project.Status = model.ProjStatusOffline
	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "已批准下架", project)
}

func RejectProjectOffline(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	if project.Status != model.ProjStatusPendingOffline {
		response.BadRequest(c, "只能审批待下架状态的项目")
		return
	}

	project.Status = model.ProjStatusRejectedOffline
	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "已拒绝下架", project)
}

func InvalidateProject(c *gin.Context) {
	id := c.Param("id")
	var project model.Project

	if err := database.DB.First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, project.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权作废此项目")
		return
	}

	project.Status = model.ProjStatusInvalid
	if err := database.DB.Save(&project).Error; err != nil {
		response.InternalError(c, "作废失败")
		return
	}

	response.SuccessWithMessage(c, "已作废", project)
}
