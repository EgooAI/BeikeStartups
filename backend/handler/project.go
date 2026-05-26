package handler

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
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

	var team model.Team
	if err := database.DB.Where("owner_id = ?", user.ID).First(&team).Error; err != nil {
		response.Forbidden(c, "需要先创建团队")
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

	if err := query.Find(&projects).Error; err != nil {
		response.InternalError(c, "获取项目列表失败")
		return
	}

	response.Success(c, projects)
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
