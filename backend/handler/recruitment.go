package handler

import (
	"fmt"
	"time"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/repository"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

type CreateRecruitmentRequest struct {
	Title        string     `json:"title" binding:"required,max=200"`
	Description  string     `json:"description" binding:"required"`
	Requirements string     `json:"requirements"`
	Position     string     `json:"position" binding:"required,max=100"`
	Salary       string     `json:"salary"`
	Deadline     *time.Time `json:"deadline"`
}

type UpdateRecruitmentRequest struct {
	Title        *string    `json:"title"`
	Description  *string    `json:"description"`
	Requirements *string    `json:"requirements"`
	Position     *string    `json:"position"`
	Salary       *string    `json:"salary"`
	Deadline     *time.Time `json:"deadline"`
}

func CreateRecruitment(c *gin.Context) {
	var req CreateRecruitmentRequest
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
		response.Forbidden(c, "团队认证未通过，无法发布招募")
		return
	}

	recruitment := model.Recruitment{
		Title:        req.Title,
		Description:  req.Description,
		Requirements: req.Requirements,
		Status:       model.RecruitStatusActive,
		TeamID:       team.ID,
		Position:     req.Position,
		Salary:       req.Salary,
		Deadline:     req.Deadline,
	}

	if err := database.DB.Create(&recruitment).Error; err != nil {
		response.InternalError(c, "创建招募失败")
		return
	}

	response.Success(c, recruitment)
}

func GetRecruitment(c *gin.Context) {
	id := c.Param("id")
	var recruitment model.Recruitment

	if err := database.DB.Preload("Team").First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if recruitment.Status == model.RecruitStatusInvalid && (user == nil || user.Role != model.RoleAdmin) {
		var team model.Team
		if err := database.DB.First(&team, recruitment.TeamID).Error; err == nil && team.OwnerID != user.ID {
			response.Forbidden(c, "无权查看此招募")
			return
		}
	}

	response.Success(c, recruitment)
}

func UpdateRecruitment(c *gin.Context) {
	id := c.Param("id")
	var req UpdateRecruitmentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || team.OwnerID != user.ID {
		response.Forbidden(c, "无权修改此招募")
		return
	}

	if recruitment.Status != model.RecruitStatusActive {
		response.BadRequest(c, "只能修改活跃状态的招募")
		return
	}

	if req.Title != nil {
		recruitment.Title = *req.Title
	}
	if req.Description != nil {
		recruitment.Description = *req.Description
	}
	if req.Requirements != nil {
		recruitment.Requirements = *req.Requirements
	}
	if req.Position != nil {
		recruitment.Position = *req.Position
	}
	if req.Salary != nil {
		recruitment.Salary = *req.Salary
	}
	if req.Deadline != nil {
		recruitment.Deadline = req.Deadline
	}

	if err := database.DB.Save(&recruitment).Error; err != nil {
		response.InternalError(c, "更新招募失败")
		return
	}

	response.Success(c, recruitment)
}

func DeleteRecruitment(c *gin.Context) {
	id := c.Param("id")
	var recruitment model.Recruitment

	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权删除此招募")
		return
	}

	if err := database.DB.Delete(&recruitment).Error; err != nil {
		response.InternalError(c, "删除招募失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func ListRecruitments(c *gin.Context) {
	// pagination
	page := 1
	limit := 20
	if p := c.Query("page"); p != "" {
		fmt.Sscan(p, &page)
	}
	if l := c.Query("limit"); l != "" {
		fmt.Sscan(l, &limit)
	}

	var recruitments []model.Recruitment
	query := database.DB.Preload("Team")

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	} else {
		query = query.Where("status = ?", model.RecruitStatusActive)
	}

	var total int64
	if err := query.Model(&model.Recruitment{}).Count(&total).Error; err != nil {
		response.InternalError(c, "获取招募总数失败")
		return
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&recruitments).Error; err != nil {
		response.InternalError(c, "获取招募列表失败")
		return
	}

	response.Success(c, gin.H{"items": recruitments, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}

func SolveRecruitment(c *gin.Context) {
	id := c.Param("id")
	var recruitment model.Recruitment

	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权解决此招募")
		return
	}

	if recruitment.Status != model.RecruitStatusActive {
		response.BadRequest(c, "只能解决活跃状态的招募")
		return
	}

	recruitment.Status = model.RecruitStatusSolved
	if err := database.DB.Save(&recruitment).Error; err != nil {
		response.InternalError(c, "解决失败")
		return
	}

	response.SuccessWithMessage(c, "已标记为已解决", recruitment)
}

func InvalidateRecruitment(c *gin.Context) {
	id := c.Param("id")
	var recruitment model.Recruitment

	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权作废此招募")
		return
	}

	recruitment.Status = model.RecruitStatusInvalid
	if err := database.DB.Save(&recruitment).Error; err != nil {
		response.InternalError(c, "作废失败")
		return
	}

	response.SuccessWithMessage(c, "已作废", recruitment)
}
