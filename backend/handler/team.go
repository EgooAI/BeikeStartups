package handler

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
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

func CreateTeam(c *gin.Context) {
	var req CreateTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)

	if user.Role != model.RoleStudent {
		response.Forbidden(c, "只有学生可以创建团队")
		return
	}

	var approvedApp model.StartupApplication
	if err := database.DB.Where("user_id = ? AND status = ?", user.ID, model.AppStatusApproved).First(&approvedApp).Error; err != nil {
		response.Forbidden(c, "需要先通过创业申请审批才能创建团队")
		return
	}

	team := model.Team{
		Name:        req.Name,
		Description: req.Description,
		Logo:        req.Logo,
		Status:      model.TeamStatusApproved,
		OwnerID:     user.ID,
	}

	if err := database.DB.Create(&team).Error; err != nil {
		response.InternalError(c, "创建团队失败")
		return
	}

	response.Success(c, team)
}

func GetTeam(c *gin.Context) {
	id := c.Param("id")
	var team model.Team

	if err := database.DB.Preload("Owner").Preload("Members").First(&team, id).Error; err != nil {
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

	var team model.Team
	if err := database.DB.First(&team, id).Error; err != nil {
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

	if err := database.DB.Save(&team).Error; err != nil {
		response.InternalError(c, "更新团队失败")
		return
	}

	response.Success(c, team)
}

func DeleteTeam(c *gin.Context) {
	id := c.Param("id")
	var team model.Team

	if err := database.DB.First(&team, id).Error; err != nil {
		response.NotFound(c, "团队不存在")
		return
	}

	if err := database.DB.Delete(&team).Error; err != nil {
		response.InternalError(c, "删除团队失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func ListTeams(c *gin.Context) {
	var teams []model.Team
	query := database.DB.Preload("Owner")

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&teams).Error; err != nil {
		response.InternalError(c, "获取团队列表失败")
		return
	}

	response.Success(c, teams)
}
