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
	Industry    string `json:"industry"`
	FundingNeed string `json:"funding_need"`
	Stage       string `json:"stage"`
}

type UpdateProjectRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Content     *string `json:"content"`
	CoverImage  *string `json:"cover_image"`
	IsPublic    *bool   `json:"is_public"`
	Tags        *string `json:"tags"`
	Industry    *string `json:"industry"`
	FundingNeed *string `json:"funding_need"`
	Stage       *string `json:"stage"`
}

func CreateProject(c *gin.Context) {
	var req CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)

	// 普通学生用户禁止创建项目草稿
	if user.Role == model.RoleStudent {
		response.Forbidden(c, "普通学生用户无法创建项目，请先申请成为团队角色")
		return
	}

	// 草稿项目不需要团队认证，申请上架时才需要
	var teamID uint = 0
	if user.Role == model.RoleTeamOwner {
		team, err := repository.GetTeamByOwnerID(user.ID)
		if err != nil {
			response.Forbidden(c, "需要先创建团队")
			return
		}
		teamID = team.ID
	}

	stage := model.ProjStageIdea
	if req.Stage != "" {
		stage = model.ProjectStage(req.Stage)
	}

	project := model.Project{
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		CoverImage:  req.CoverImage,
		Status:      model.ProjStatusDraft,
		IsPublic:    req.IsPublic,
		TeamID:      teamID,
		UserID:      user.ID,
		Tags:        req.Tags,
		Industry:    req.Industry,
		FundingNeed: req.FundingNeed,
		Stage:       stage,
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

	// 公开项目（已上架且公开）任何人都可以查看
	if project.Status == model.ProjStatusOnline && project.IsPublic {
		project.ViewCount++
		database.DB.Save(&project)
		response.Success(c, project)
		return
	}

	// 未上架或私有项目需要登录
	userValue, exists := c.Get("user")
	if !exists || userValue == nil {
		response.Forbidden(c, "项目未上架或为私有项目，需要登录查看")
		return
	}

	user := userValue.(*model.User)
	if project.Status != model.ProjStatusOnline {
		var team model.Team
		if err := database.DB.First(&team, project.TeamID).Error; err == nil && team.OwnerID != user.ID && user.Role != model.RoleAdmin && user.Role != model.RoleSuperAdmin {
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
	if err := database.DB.Preload("Team").First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	isTeamOwner := project.Team != nil && project.Team.OwnerID == user.ID
	isAdmin := user.Role == model.RoleAdmin || user.Role == model.RoleSuperAdmin

	if !isTeamOwner && !isAdmin {
		response.Forbidden(c, "无权修改此项目")
		return
	}

	// 阶段修改允许在任何项目状态下进行（仅团队负责人和管理员可修改）
	isOnlyStageUpdate := req.Stage != nil && req.Title == nil && req.Description == nil && req.Content == nil && req.CoverImage == nil && req.IsPublic == nil && req.Tags == nil && req.Industry == nil && req.FundingNeed == nil

	// 非阶段修改需要项目处于可编辑状态
	if !isOnlyStageUpdate {
		if project.Status != model.ProjStatusDraft && project.Status != model.ProjStatusRejectedOnline && project.Status != model.ProjStatusRejectedOffline {
			response.BadRequest(c, "当前状态不允许修改")
			return
		}
	}

	// 验证阶段值是否合法
	validStages := map[model.ProjectStage]bool{
		model.ProjStageIdea:      true,
		model.ProjStageSeed:      true,
		model.ProjStagePrototype: true,
		model.ProjStageLaunched:  true,
		model.ProjStageRevenue:   true,
	}

	if req.Stage != nil {
		newStage := model.ProjectStage(*req.Stage)
		if !validStages[newStage] {
			response.BadRequest(c, "无效的项目阶段")
			return
		}
		project.Stage = newStage
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
	if req.Industry != nil {
		project.Industry = *req.Industry
	}
	if req.FundingNeed != nil {
		project.FundingNeed = *req.FundingNeed
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

	if err := database.DB.Preload("Team").First(&project, id).Error; err != nil {
		response.NotFound(c, "项目不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	isTeamOwner := project.Team != nil && project.Team.OwnerID == user.ID
	isAdmin := user.Role == model.RoleAdmin || user.Role == model.RoleSuperAdmin

	if !isTeamOwner && !isAdmin {
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

	// 检查用户是否为管理员
	isAdmin := false
	if userValue, exists := c.Get("user"); exists && userValue != nil {
		if user, ok := userValue.(*model.User); ok {
			if user.Role == model.RoleAdmin || user.Role == model.RoleSuperAdmin {
				isAdmin = true
			}
		}
	}

	// 如果是管理员且没有指定状态，显示所有状态
	// 如果是普通用户且没有指定状态，需要根据用户角色来决定
	if status != "" {
		query = query.Where("status = ?", status)
	} else if !isAdmin {
		// 检查用户是否已登录
		if userValue, exists := c.Get("user"); exists && userValue != nil {
			if user, ok := userValue.(*model.User); ok {
				// 对于登录用户，显示自己的所有项目（通过 UserID 过滤）
				query = query.Where("user_id = ?", user.ID)
			} else {
				// 未登录用户只显示已上架的项目
				query = query.Where("status = ?", model.ProjStatusOnline)
			}
		} else {
			// 未登录用户只显示已上架的项目
			query = query.Where("status = ?", model.ProjStatusOnline)
		}
	}

	isPublic := c.Query("is_public")
	if isPublic == "true" {
		query = query.Where("is_public = ?", true)
	}

	stage := c.Query("stage")
	if stage != "" {
		query = query.Where("stage = ?", stage)
	}

	tag := c.Query("tag")
	if tag != "" {
		query = query.Where("tags LIKE ?", "%"+tag+"%")
	}

	industry := c.Query("industry")
	if industry != "" {
		query = query.Where("industry = ?", industry)
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
	RequestType model.RequestType `json:"request_type" binding:"required"`
	Message     string            `json:"message" binding:"required"`
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
		ProjectID:   project.ID,
		UserID:      user.ID,
		RequestType: req.RequestType,
		Message:     req.Message,
		Status:      model.RequestStatusPending,
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

	response.Success(c, gin.H{"items": requests})
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

	// 开启事务
	tx := database.DB.Begin()

	// 更新申请状态
	connReq.Status = model.RequestStatusAccepted
	if err := tx.Save(&connReq).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "审批对接申请失败")
		return
	}

	// 根据申请类型创建关联记录
	switch connReq.RequestType {
	case model.RequestTypeBecomeMentor:
		mentor := model.ProjectMentor{
			ProjectID: connReq.ProjectID,
			UserID:    connReq.UserID,
			Message:   connReq.Message,
		}
		if err := tx.Create(&mentor).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "创建导师关联失败")
			return
		}
	case model.RequestTypeBPAccess:
		investor := model.ProjectInvestor{
			ProjectID: connReq.ProjectID,
			UserID:    connReq.UserID,
			Message:   connReq.Message,
		}
		if err := tx.Create(&investor).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "创建投资人关联失败")
			return
		}
	case model.RequestTypeResourcePartner:
		partner := model.ProjectPartner{
			ProjectID: connReq.ProjectID,
			UserID:    connReq.UserID,
			Message:   connReq.Message,
		}
		if err := tx.Create(&partner).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "创建资源方关联失败")
			return
		}
	}

	tx.Commit()
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

	// 检查项目是否属于当前用户
	if project.TeamID != 0 {
		var team model.Team
		if err := database.DB.First(&team, project.TeamID).Error; err != nil || team.OwnerID != user.ID {
			response.Forbidden(c, "无权执行此操作")
			return
		}
	} else {
		// 项目没有关联团队，需要先创建或关联团队
		team, err := repository.GetTeamByOwnerID(user.ID)
		if err != nil {
			response.Forbidden(c, "需要先创建团队才能申请上架")
			return
		}
		if team.Status != model.TeamStatusApproved {
			response.Forbidden(c, "团队认证未通过，无法申请上架")
			return
		}
		project.TeamID = team.ID
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

// GetUserConnectedProjects 获取用户关联的项目（导师/投资人/资源方）
func GetUserConnectedProjects(c *gin.Context) {
	user := c.MustGet("user").(*model.User)

	var projects []model.Project

	switch user.Role {
	case model.RoleMentor:
		// 获取导师关联的项目
		var mentors []model.ProjectMentor
		if err := database.DB.Preload("Project").Where("user_id = ?", user.ID).Find(&mentors).Error; err != nil {
			response.InternalError(c, "获取项目失败")
			return
		}
		for _, m := range mentors {
			if m.Project != nil {
				projects = append(projects, *m.Project)
			}
		}
	case model.RoleInvestor:
		// 获取投资人关联的项目
		var investors []model.ProjectInvestor
		if err := database.DB.Preload("Project").Where("user_id = ?", user.ID).Find(&investors).Error; err != nil {
			response.InternalError(c, "获取项目失败")
			return
		}
		for _, i := range investors {
			if i.Project != nil {
				projects = append(projects, *i.Project)
			}
		}
	case model.RolePartner:
		// 获取资源方关联的项目
		var partners []model.ProjectPartner
		if err := database.DB.Preload("Project").Where("user_id = ?", user.ID).Find(&partners).Error; err != nil {
			response.InternalError(c, "获取项目失败")
			return
		}
		for _, p := range partners {
			if p.Project != nil {
				projects = append(projects, *p.Project)
			}
		}
	default:
		response.BadRequest(c, "当前角色没有关联项目功能")
		return
	}

	response.Success(c, gin.H{"items": projects})
}
