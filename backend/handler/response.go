package handler

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

type CreateResponseRequest struct {
	RecruitmentID uint   `json:"recruitment_id" binding:"required"`
	CoverLetter   string `json:"cover_letter" binding:"required"`
	Resume        string `json:"resume"`
}

type UpdateResponseRequest struct {
	CoverLetter *string `json:"cover_letter"`
	Resume      *string `json:"resume"`
}

type ReviewResponseRequest struct {
	Note string `json:"note"`
}

func CreateResponse(c *gin.Context) {
	var req CreateResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)

	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, req.RecruitmentID).Error; err != nil {
		response.NotFound(c, "招募不存在")
		return
	}

	if recruitment.Status != model.RecruitStatusActive {
		response.BadRequest(c, "只能响应活跃状态的招募")
		return
	}

	recruitmentResponse := model.RecruitmentResponse{
		RecruitmentID: req.RecruitmentID,
		UserID:        user.ID,
		CoverLetter:   req.CoverLetter,
		Resume:        req.Resume,
		Status:        model.RespStatusPending,
	}

	if err := database.DB.Create(&recruitmentResponse).Error; err != nil {
		response.InternalError(c, "创建响应失败")
		return
	}

	response.Success(c, recruitmentResponse)
}

func GetResponse(c *gin.Context) {
	id := c.Param("id")
	var resp model.RecruitmentResponse

	if err := database.DB.Preload("User").Preload("Recruitment").First(&resp, id).Error; err != nil {
		response.NotFound(c, "响应不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, resp.RecruitmentID).Error; err != nil {
		response.Forbidden(c, "无权查看此响应")
		return
	}

	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权查看此响应")
		return
	}

	response.Success(c, resp)
}

func UpdateResponse(c *gin.Context) {
	id := c.Param("id")
	var req UpdateResponseRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var resp model.RecruitmentResponse
	if err := database.DB.First(&resp, id).Error; err != nil {
		response.NotFound(c, "响应不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if resp.UserID != user.ID && user.Role != model.RoleAdmin {
		response.Forbidden(c, "无权修改此响应")
		return
	}

	if resp.Status != model.RespStatusPending {
		response.BadRequest(c, "只能修改待处理状态的响应")
		return
	}

	if req.CoverLetter != nil {
		resp.CoverLetter = *req.CoverLetter
	}
	if req.Resume != nil {
		resp.Resume = *req.Resume
	}

	if err := database.DB.Save(&resp).Error; err != nil {
		response.InternalError(c, "更新响应失败")
		return
	}

	response.Success(c, resp)
}

func DeleteResponse(c *gin.Context) {
	id := c.Param("id")
	var resp model.RecruitmentResponse

	if err := database.DB.First(&resp, id).Error; err != nil {
		response.NotFound(c, "响应不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if resp.UserID != user.ID && user.Role != model.RoleAdmin {
		response.Forbidden(c, "无权删除此响应")
		return
	}

	if err := database.DB.Delete(&resp).Error; err != nil {
		response.InternalError(c, "删除响应失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func AcceptResponse(c *gin.Context) {
	id := c.Param("id")
	var req ReviewResponseRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var resp model.RecruitmentResponse
	if err := database.DB.First(&resp, id).Error; err != nil {
		response.NotFound(c, "响应不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, resp.RecruitmentID).Error; err != nil {
		response.Forbidden(c, "无权审批此响应")
		return
	}

	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权审批此响应")
		return
	}

	if resp.Status != model.RespStatusPending {
		response.BadRequest(c, "只能审批待处理状态的响应")
		return
	}

	resp.Status = model.RespStatusAccepted
	resp.ReviewNote = req.Note

	if err := database.DB.Save(&resp).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "已录取", resp)
}

func RejectResponse(c *gin.Context) {
	id := c.Param("id")
	var req ReviewResponseRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var resp model.RecruitmentResponse
	if err := database.DB.First(&resp, id).Error; err != nil {
		response.NotFound(c, "响应不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	var recruitment model.Recruitment
	if err := database.DB.First(&recruitment, resp.RecruitmentID).Error; err != nil {
		response.Forbidden(c, "无权审批此响应")
		return
	}

	var team model.Team
	if err := database.DB.First(&team, recruitment.TeamID).Error; err != nil || (team.OwnerID != user.ID && user.Role != model.RoleAdmin) {
		response.Forbidden(c, "无权审批此响应")
		return
	}

	if resp.Status != model.RespStatusPending {
		response.BadRequest(c, "只能审批待处理状态的响应")
		return
	}

	resp.Status = model.RespStatusRejected
	resp.ReviewNote = req.Note

	if err := database.DB.Save(&resp).Error; err != nil {
		response.InternalError(c, "审批失败")
		return
	}

	response.SuccessWithMessage(c, "已拒绝", resp)
}

func InvalidateResponse(c *gin.Context) {
	id := c.Param("id")
	var resp model.RecruitmentResponse

	if err := database.DB.First(&resp, id).Error; err != nil {
		response.NotFound(c, "响应不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if resp.UserID != user.ID && user.Role != model.RoleAdmin {
		response.Forbidden(c, "无权作废此响应")
		return
	}

	resp.Status = model.RespStatusInvalid
	if err := database.DB.Save(&resp).Error; err != nil {
		response.InternalError(c, "作废失败")
		return
	}

	response.SuccessWithMessage(c, "已作废", resp)
}
