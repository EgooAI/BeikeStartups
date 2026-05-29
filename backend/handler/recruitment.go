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
	user := c.MustGet("user").(*model.User)

	// 检查权限：学生或项目负责人
	if user.Role != model.RoleStudent && user.Role != model.RoleTeamOwner {
		response.Forbidden(c, "只有学生和项目负责人可以访问招募广场")
		return
	}

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

	// 如果是项目负责人查看自己发布的招募
	if c.Query("my") == "true" && user.Role == model.RoleTeamOwner {
		team, err := repository.GetTeamByOwnerID(user.ID)
		if err != nil {
			response.InternalError(c, "获取团队信息失败")
			return
		}
		query = query.Where("team_id = ?", team.ID)
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

type ApplyRecruitmentRequest struct {
	CoverLetter string `json:"cover_letter" binding:"required"`
	Resume      string `json:"resume"`
}

func ApplyRecruitment(c *gin.Context) {
	id := c.Param("id")
	var req ApplyRecruitmentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	if recruitment.Status != model.RecruitStatusActive {
		response.BadRequest(c, "该招募已结束")
		return
	}

	user := c.MustGet("user").(*model.User)

	if user.Role != model.RoleStudent {
		response.Forbidden(c, "只有学生可以申请招募")
		return
	}

	var existingResponse model.RecruitmentResponse
	if err := database.DB.Where("user_id = ? AND status IN (?, ?)", user.ID, model.RespStatusPending, model.RespStatusAccepted).First(&existingResponse).Error; err == nil {
		response.BadRequest(c, "您已经有申请在处理中，请等待审核完成")
		return
	}

	recruitmentResponse := model.RecruitmentResponse{
		CoverLetter:   req.CoverLetter,
		Resume:        req.Resume,
		Status:        model.RespStatusPending,
		RecruitmentID: recruitment.ID,
		UserID:        user.ID,
	}

	if err := database.DB.Create(&recruitmentResponse).Error; err != nil {
		response.InternalError(c, "申请失败")
		return
	}

	response.Success(c, recruitmentResponse)
}

func GetRecruitmentResponses(c *gin.Context) {
	id := c.Param("id")
	var recruitment model.Recruitment

	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权查看此招募的申请")
		return
	}

	var responses []model.RecruitmentResponse
	if err := database.DB.Preload("User").Where("recruitment_id = ?", id).Find(&responses).Error; err != nil {
		response.InternalError(c, "获取申请列表失败")
		return
	}

	response.Success(c, gin.H{"items": responses})
}

func AcceptRecruitmentResponse(c *gin.Context) {
	id := c.Param("id")
	responseID := c.Param("response_id")

	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	var resp model.RecruitmentResponse
	if err := database.DB.Preload("User").First(&resp, responseID).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	if resp.RecruitmentID != recruitment.ID {
		response.BadRequest(c, "申请不属于该招募")
		return
	}

	if resp.Status != model.RespStatusPending {
		response.BadRequest(c, "只能处理待审核的申请")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权处理此申请")
		return
	}

	tx := database.DB.Begin()

	resp.Status = model.RespStatusAccepted
	if err := tx.Save(&resp).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "处理申请失败")
		return
	}

	if err := tx.Model(&resp.User).Update("role", model.RoleTeamMember).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "更新用户角色失败")
		return
	}

	// 先检查用户是否已经是团队成员
	var exists int64
	if err := tx.Table("team_members").Where("team_id = ? AND user_id = ?", recruitment.TeamID, resp.User.ID).Count(&exists).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "检查成员状态失败")
		return
	}

	if exists > 0 {
		// 用户已经是团队成员，跳过添加
	} else {
		// 直接插入 team_members 中间表
		if err := tx.Exec("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)", recruitment.TeamID, resp.User.ID).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "添加团队成员失败: "+err.Error())
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		response.InternalError(c, "提交事务失败")
		return
	}

	response.SuccessWithMessage(c, "已通过申请，用户已成为团队成员", resp)
}

func RejectRecruitmentResponse(c *gin.Context) {
	id := c.Param("id")
	responseID := c.Param("response_id")

	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	var resp model.RecruitmentResponse
	if err := database.DB.First(&resp, responseID).Error; err != nil {
		response.NotFound(c, "申请不存在")
		return
	}

	if resp.RecruitmentID != recruitment.ID {
		response.BadRequest(c, "申请不属于该招募")
		return
	}

	if resp.Status != model.RespStatusPending {
		response.BadRequest(c, "只能处理待审核的申请")
		return
	}

	user := c.MustGet("user").(*model.User)
	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权处理此申请")
		return
	}

	resp.Status = model.RespStatusRejected
	if err := database.DB.Save(&resp).Error; err != nil {
		response.InternalError(c, "处理申请失败")
		return
	}

	response.SuccessWithMessage(c, "已拒绝申请", resp)
}
