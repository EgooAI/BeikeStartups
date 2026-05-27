package handler

import (
	"fmt"
	"time"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

type CreateApplicationRequest struct {
	Title        string `json:"title" binding:"required,max=200"`
	Description  string `json:"description" binding:"required"`
	BusinessPlan string `json:"business_plan"`
}

type UpdateApplicationRequest struct {
	Title        *string `json:"title"`
	Description  *string `json:"description"`
	BusinessPlan *string `json:"business_plan"`
}

type ReviewApplicationRequest struct {
	Note string `json:"note"`
}

func CreateApplication(c *gin.Context) {
	var req CreateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)

	application := model.StartupApplication{
		Title:        req.Title,
		Description:  req.Description,
		BusinessPlan: req.BusinessPlan,
		Status:       model.AppStatusDraft,
		UserID:       user.ID,
	}

	if err := database.DB.Create(&application).Error; err != nil {
		response.InternalError(c, "创建申请失败")
		return
	}

	response.Success(c, application)
}

func GetApplication(c *gin.Context) {
	id := c.Param("id")
	var application model.StartupApplication

	if err := database.DB.Preload("User").First(&application, id).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if user == nil || (application.UserID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权查看此申请")
		return
	}

	response.Success(c, application)
}

func UpdateApplication(c *gin.Context) {
	id := c.Param("id")
	var req UpdateApplicationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var application model.StartupApplication
	if err := database.DB.First(&application, id).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if application.UserID != user.ID && user.Role != model.RoleAdmin {
		response.Forbidden(c, "无权修改此申请")
		return
	}

	if application.Status != model.AppStatusDraft {
		response.BadRequest(c, "只能修改草稿状态的申请")
		return
	}

	if req.Title != nil {
		application.Title = *req.Title
	}
	if req.Description != nil {
		application.Description = *req.Description
	}
	if req.BusinessPlan != nil {
		application.BusinessPlan = *req.BusinessPlan
	}

	if err := database.DB.Save(&application).Error; err != nil {
		response.InternalError(c, "更新申请失败")
		return
	}

	response.Success(c, application)
}

func DeleteApplication(c *gin.Context) {
	id := c.Param("id")
	var application model.StartupApplication

	if err := database.DB.First(&application, id).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if application.UserID != user.ID && user.Role != model.RoleAdmin {
		response.Forbidden(c, "无权删除此申请")
		return
	}

	if err := database.DB.Delete(&application).Error; err != nil {
		response.InternalError(c, "删除申请失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func ListApplications(c *gin.Context) {
	user := c.MustGet("user").(*model.User)

	// pagination
	page := 1
	limit := 20
	if p := c.Query("page"); p != "" {
		fmt.Sscan(p, &page)
	}
	if l := c.Query("limit"); l != "" {
		fmt.Sscan(l, &limit)
	}

	var applications []model.StartupApplication
	query := database.DB.Preload("User")
	if user.Role != model.RoleAdmin {
		query = query.Where("user_id = ?", user.ID)
	}

	var total int64
	if err := query.Model(&model.StartupApplication{}).Count(&total).Error; err != nil {
		response.InternalError(c, "获取申请列表总数失败")
		return
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&applications).Error; err != nil {
		response.InternalError(c, "获取申请列表失败")
		return
	}

	response.Success(c, gin.H{"items": applications, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}

func SubmitApplication(c *gin.Context) {
	id := c.Param("id")
	var application model.StartupApplication

	if err := database.DB.First(&application, id).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if application.UserID != user.ID {
		response.Forbidden(c, "无权提交此申请")
		return
	}

	if application.Status != model.AppStatusDraft {
		response.BadRequest(c, "只能提交草稿状态的申请")
		return
	}

	application.Status = model.AppStatusPending
	if err := database.DB.Save(&application).Error; err != nil {
		response.InternalError(c, "提交申请失败")
		return
	}

	response.SuccessWithMessage(c, "提交成功", application)
}

func ApproveApplication(c *gin.Context) {
	id := c.Param("id")
	var req ReviewApplicationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var application model.StartupApplication
	if err := database.DB.First(&application, id).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	if application.Status != model.AppStatusPending {
		response.BadRequest(c, "只能审批待审核状态的申请")
		return
	}

	user := c.MustGet("user").(*model.User)
	now := time.Now()
	application.Status = model.AppStatusApproved
	application.ReviewNote = req.Note
	application.ReviewedBy = &user.ID
	application.ReviewedAt = &now

	if err := database.DB.Save(&application).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "审批通过", application)
}

func RejectApplication(c *gin.Context) {
	id := c.Param("id")
	var req ReviewApplicationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var application model.StartupApplication
	if err := database.DB.First(&application, id).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	if application.Status != model.AppStatusPending {
		response.BadRequest(c, "只能审批待审核状态的申请")
		return
	}

	user := c.MustGet("user").(*model.User)
	now := time.Now()
	application.Status = model.AppStatusRejected
	application.ReviewNote = req.Note
	application.ReviewedBy = &user.ID
	application.ReviewedAt = &now

	if err := database.DB.Save(&application).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "已驳回", application)
}
