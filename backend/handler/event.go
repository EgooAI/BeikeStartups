package handler

import (
	"fmt"
	"time"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

type CreateEventRequest struct {
	Title       string    `json:"title" binding:"required,max=200"`
	Description string    `json:"description" binding:"required"`
	EventType   string    `json:"event_type" binding:"required"`
	Location    string    `json:"location" binding:"required"`
	StartAt     time.Time `json:"start_at" binding:"required"`
	EndAt       time.Time `json:"end_at" binding:"required"`
	Status      string    `json:"status" binding:"required,oneof=active closed cancelled"`
}

type UpdateEventRequest struct {
	Title       *string    `json:"title"`
	Description *string    `json:"description"`
	EventType   *string    `json:"event_type"`
	Location    *string    `json:"location"`
	StartAt     *time.Time `json:"start_at"`
	EndAt       *time.Time `json:"end_at"`
	Status      *string    `json:"status"`
}

type EventSignupRequest struct {
}

func ListEvents(c *gin.Context) {
	page := 1
	limit := 20
	if p := c.Query("page"); p != "" {
		fmt.Sscan(p, &page)
	}
	if l := c.Query("limit"); l != "" {
		fmt.Sscan(l, &limit)
	}

	var events []model.Event
	query := database.DB
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	} else {
		query = query.Where("status = ?", model.EventStatusActive)
	}

	var total int64
	if err := query.Model(&model.Event{}).Count(&total).Error; err != nil {
		response.InternalError(c, "获取活动总数失败")
		return
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&events).Error; err != nil {
		response.InternalError(c, "获取活动列表失败")
		return
	}

	response.Success(c, gin.H{"items": events, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}

func GetEvent(c *gin.Context) {
	id := c.Param("id")
	var event model.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		response.NotFound(c, "活动不存在")
		return
	}

	response.Success(c, event)
}

func CreateEvent(c *gin.Context) {
	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)
	event := model.Event{
		Title:       req.Title,
		Description: req.Description,
		EventType:   req.EventType,
		Location:    req.Location,
		StartAt:     req.StartAt,
		EndAt:       req.EndAt,
		Status:      model.EventStatus(req.Status),
		OwnerID:     user.ID,
	}

	if err := database.DB.Create(&event).Error; err != nil {
		response.InternalError(c, "创建活动失败")
		return
	}

	response.Success(c, event)
}

func UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	var req UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	var event model.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		response.NotFound(c, "活动不存在")
		return
	}

	if req.Title != nil {
		event.Title = *req.Title
	}
	if req.Description != nil {
		event.Description = *req.Description
	}
	if req.EventType != nil {
		event.EventType = *req.EventType
	}
	if req.Location != nil {
		event.Location = *req.Location
	}
	if req.StartAt != nil {
		event.StartAt = *req.StartAt
	}
	if req.EndAt != nil {
		event.EndAt = *req.EndAt
	}
	if req.Status != nil {
		event.Status = model.EventStatus(*req.Status)
	}

	if err := database.DB.Save(&event).Error; err != nil {
		response.InternalError(c, "更新活动失败")
		return
	}

	response.Success(c, event)
}

func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	var event model.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		response.NotFound(c, "活动不存在")
		return
	}

	if err := database.DB.Delete(&event).Error; err != nil {
		response.InternalError(c, "删除活动失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func SignUpEvent(c *gin.Context) {
	id := c.Param("id")
	var event model.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		response.NotFound(c, "活动不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	signup := model.EventSignup{
		EventID: event.ID,
		UserID:  user.ID,
	}

	if err := database.DB.Create(&signup).Error; err != nil {
		response.BadRequest(c, "您已报名该活动或报名失败")
		return
	}

	response.Success(c, signup)
}

func GetEventSignup(c *gin.Context) {
	id := c.Param("id")
	user := c.MustGet("user").(*model.User)

	var signup model.EventSignup
	if err := database.DB.Where("event_id = ? AND user_id = ?", id, user.ID).First(&signup).Error; err != nil {
		response.Success(c, nil)
		return
	}

	response.Success(c, signup)
}

func CancelEventSignup(c *gin.Context) {
	id := c.Param("id")
	user := c.MustGet("user").(*model.User)

	if err := database.DB.Where("event_id = ? AND user_id = ?", id, user.ID).Delete(&model.EventSignup{}).Error; err != nil {
		response.InternalError(c, "取消报名失败")
		return
	}

	response.SuccessWithMessage(c, "已取消报名", nil)
}

func ConfirmEventSignup(c *gin.Context) {
	signupID := c.Param("id")

	var signup model.EventSignup
	if err := database.DB.First(&signup, signupID).Error; err != nil {
		response.NotFound(c, "报名记录不存在")
		return
	}

	signup.Status = "confirmed"
	if err := database.DB.Save(&signup).Error; err != nil {
		response.InternalError(c, "确认报名失败")
		return
	}

	response.SuccessWithMessage(c, "已确认报名", signup)
}

func ListEventSignups(c *gin.Context) {
	id := c.Param("id")
	var event model.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		response.NotFound(c, "活动不存在")
		return
	}

	var signups []model.EventSignup
	if err := database.DB.Preload("User").Where("event_id = ?", event.ID).Find(&signups).Error; err != nil {
		response.InternalError(c, "获取活动报名列表失败")
		return
	}

	response.Success(c, signups)
}
