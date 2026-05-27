package handler

import (
	"fmt"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

type CreateResourceOpportunityRequest struct {
	Title        string `json:"title" binding:"required,max=200"`
	Description  string `json:"description" binding:"required"`
	ResourceType string `json:"resource_type" binding:"required,max=100"`
	Tags         string `json:"tags"`
	Contact      string `json:"contact" binding:"required,max=255"`
}

type UpdateResourceOpportunityRequest struct {
	Title        *string `json:"title"`
	Description  *string `json:"description"`
	ResourceType *string `json:"resource_type"`
	Tags         *string `json:"tags"`
	Contact      *string `json:"contact"`
	Status       *string `json:"status"`
}

func CreateResourceOpportunity(c *gin.Context) {
	var req CreateResourceOpportunityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user := c.MustGet("user").(*model.User)

	opportunity := model.ResourceOpportunity{
		Title:        req.Title,
		Description:  req.Description,
		ResourceType: req.ResourceType,
		Tags:         req.Tags,
		Contact:      req.Contact,
		Status:       model.ResourceStatusActive,
		OwnerID:      user.ID,
	}

	if err := database.DB.Create(&opportunity).Error; err != nil {
		response.InternalError(c, "创建资源机会失败")
		return
	}

	response.Success(c, opportunity)
}

func GetResourceOpportunity(c *gin.Context) {
	id := c.Param("id")
	var opportunity model.ResourceOpportunity

	if err := database.DB.Preload("Owner").First(&opportunity, id).Error; err != nil {
		response.NotFound(c, "资源机会不存在")
		return
	}

	response.Success(c, opportunity)
}

func UpdateResourceOpportunity(c *gin.Context) {
	id := c.Param("id")
	var req UpdateResourceOpportunityRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var opportunity model.ResourceOpportunity
	if err := database.DB.First(&opportunity, id).Error; err != nil {
		response.NotFound(c, "资源机会不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if opportunity.OwnerID != user.ID && user.Role != model.RoleAdmin {
		response.Forbidden(c, "无权修改此资源机会")
		return
	}

	if req.Title != nil {
		opportunity.Title = *req.Title
	}
	if req.Description != nil {
		opportunity.Description = *req.Description
	}
	if req.ResourceType != nil {
		opportunity.ResourceType = *req.ResourceType
	}
	if req.Tags != nil {
		opportunity.Tags = *req.Tags
	}
	if req.Contact != nil {
		opportunity.Contact = *req.Contact
	}
	if req.Status != nil {
		opportunity.Status = model.ResourceStatus(*req.Status)
	}

	if err := database.DB.Save(&opportunity).Error; err != nil {
		response.InternalError(c, "更新资源机会失败")
		return
	}

	response.Success(c, opportunity)
}

func DeleteResourceOpportunity(c *gin.Context) {
	id := c.Param("id")
	var opportunity model.ResourceOpportunity

	if err := database.DB.First(&opportunity, id).Error; err != nil {
		response.NotFound(c, "资源机会不存在")
		return
	}

	user := c.MustGet("user").(*model.User)
	if opportunity.OwnerID != user.ID && user.Role != model.RoleAdmin {
		response.Forbidden(c, "无权删除此资源机会")
		return
	}

	if err := database.DB.Delete(&opportunity).Error; err != nil {
		response.InternalError(c, "删除资源机会失败")
		return
	}

	response.SuccessWithMessage(c, "删除成功", nil)
}

func ListResourceOpportunities(c *gin.Context) {
	// pagination
	page := 1
	limit := 20
	if p := c.Query("page"); p != "" {
		fmt.Sscan(p, &page)
	}
	if l := c.Query("limit"); l != "" {
		fmt.Sscan(l, &limit)
	}

	var opportunities []model.ResourceOpportunity
	query := database.DB.Preload("Owner")

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	} else {
		query = query.Where("status = ?", model.ResourceStatusActive)
	}

	resourceType := c.Query("resource_type")
	if resourceType != "" {
		query = query.Where("resource_type = ?", resourceType)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("title LIKE ? OR description LIKE ? OR tags LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	if err := query.Model(&model.ResourceOpportunity{}).Count(&total).Error; err != nil {
		response.InternalError(c, "获取资源机会总数失败")
		return
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&opportunities).Error; err != nil {
		response.InternalError(c, "获取资源机会列表失败")
		return
	}

	response.Success(c, gin.H{"items": opportunities, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}
