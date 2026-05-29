package router

import (
	"net/http"

	"github.com/EgooAI/BeikeStartups/config"
	"github.com/EgooAI/BeikeStartups/handler"
	"github.com/EgooAI/BeikeStartups/middleware"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/gin-gonic/gin"
)

func corsMiddleware() gin.HandlerFunc {
	cfg := config.Load()
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", cfg.CORSOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func SetupRouter() *gin.Engine {
	router := gin.Default()
	router.Use(corsMiddleware())
	router.Use(middleware.AuthMiddleware())

	// serve uploaded files
	router.Static("/uploads", "./uploads")

	// upload endpoint（需要登录）
	router.POST("/api/uploads", middleware.RequireAuth(), handler.UploadFile)

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	auth := router.Group("/api/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.GET("/me", middleware.RequireAuth(), handler.GetCurrentUser)
		auth.PUT("/me", middleware.RequireAuth(), handler.UpdateCurrentUser)
		auth.DELETE("/me", middleware.RequireAuth(), handler.DeleteUserAccount)
		auth.POST("/change-password", middleware.RequireAuth(), handler.ChangePassword)
		auth.POST("/role-request", middleware.RequireAuth(), handler.RequestUserRole)
		auth.GET("/role-requests", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.ListRoleRequests)
		auth.POST("/role-requests/:id/approve", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.ApproveRoleRequest)
		auth.POST("/role-requests/:id/reject", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.RejectRoleRequest)
		auth.DELETE("/role-requests/:id", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.DeleteRoleRequest)
	}

	users := router.Group("/api/users")
	{
		users.GET("", handler.ListUsers)
		users.GET("/:id", handler.GetUser)
	}

	admin := router.Group("/api/admin").Use(middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin))
	{
		admin.GET("/users", handler.AdminListUsers)
		admin.PUT("/users/:id/active", handler.AdminUpdateUserActiveStatus)
		admin.PUT("/users/:id/role", handler.AdminUpdateUserRole)
		admin.POST("/users/:id/reset-role-request", handler.AdminResetRoleRequest)
	}

	superAdmin := router.Group("/api/admin").Use(middleware.RequireRole(model.RoleSuperAdmin))
	{
		superAdmin.GET("/admins", handler.AdminListAll)
		superAdmin.POST("/admins/promote", handler.AdminPromote)
		superAdmin.POST("/admins/demote", handler.AdminDemote)
	}

	applications := router.Group("/api/applications").Use(middleware.RequireAuth())
	{
		applications.POST("", handler.CreateApplication)
		applications.GET("/:id", handler.GetApplication)
		applications.PUT("/:id", handler.UpdateApplication)
		applications.DELETE("/:id", handler.DeleteApplication)
		applications.GET("", handler.ListApplications)
		applications.POST("/:id/submit", handler.SubmitApplication)
		applications.POST("/:id/approve", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.ApproveApplication)
		applications.POST("/:id/reject", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.RejectApplication)
	}

	teams := router.Group("/api/teams").Use(middleware.RequireAuth())
	{
		teams.GET("", handler.ListTeams)
		teams.GET("/:id", handler.GetTeam)
		teams.GET("/my/members", handler.GetMyTeamMembers)
		teams.GET("/:id/members", handler.ListTeamMembers)
		teams.GET("/:id/invitations", handler.ListTeamInvitations)
		teams.GET("/:id/join-requests", handler.ListTeamJoinRequests)
		teams.POST("", handler.CreateTeam)
		teams.PUT("/:id", handler.UpdateTeam)
		teams.POST("/:id/members", handler.AddTeamMember)
		teams.POST("/:id/invite", handler.InviteTeamMember)
		teams.POST("/:id/invitations/:invite_id/accept", handler.AcceptTeamInvitation)
		teams.POST("/:id/invitations/:invite_id/reject", handler.RejectTeamInvitation)
		teams.POST("/:id/join-requests", handler.RequestTeamJoin)
		teams.POST("/:id/join-requests/:request_id/approve", handler.ApproveTeamJoinRequest)
		teams.POST("/:id/join-requests/:request_id/reject", handler.RejectTeamJoinRequest)
		teams.POST("/:id/transfer-owner", handler.TransferTeamOwnership)
		teams.POST("/:id/leave", handler.LeaveTeam)
		teams.POST("/:id/approve", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.ApproveTeam)
		teams.POST("/:id/reject", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.RejectTeam)
	}

	projects := router.Group("/api/projects").Use(middleware.RequireAuth())
	{
		projects.POST("", handler.CreateProject)
		projects.PUT("/:id", handler.UpdateProject)
		projects.DELETE("/:id", handler.DeleteProject)
		projects.POST("/:id/request-online", handler.RequestProjectOnline)
		projects.POST("/:id/approve-online", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.ApproveProjectOnline)
		projects.POST("/:id/reject-online", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.RejectProjectOnline)
		projects.POST("/:id/request-offline", handler.RequestProjectOffline)
		projects.POST("/:id/approve-offline", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.ApproveProjectOffline)
		projects.POST("/:id/reject-offline", middleware.RequireRole(model.RoleAdmin, model.RoleSuperAdmin), handler.RejectProjectOffline)
		projects.POST("/:id/invalidate", handler.InvalidateProject)
		projects.POST("/:id/favorite", handler.FavoriteProject)
		projects.DELETE("/:id/favorite", handler.UnfavoriteProject)
		projects.GET("/favorites", handler.ListFavoriteProjects)
		projects.POST("/:id/bp-request", handler.RequestProjectBP)
		projects.GET("/:id/bp-requests", handler.ListProjectBPRequests)
		projects.POST("/:id/bp-requests/:request_id/approve", handler.ApproveProjectBPRequest)
		projects.POST("/:id/bp-requests/:request_id/reject", handler.RejectProjectBPRequest)
		projects.POST("/:id/connection-requests", handler.CreateProjectConnectionRequest)
		projects.GET("/:id/connection-requests", handler.ListProjectConnectionRequests)
		projects.POST("/:id/connection-requests/:request_id/accept", handler.AcceptProjectConnectionRequest)
		projects.POST("/:id/connection-requests/:request_id/reject", handler.RejectProjectConnectionRequest)
		projects.GET("/my-connections", handler.GetUserConnectedProjects)
	}

	// 公开项目接口（无需认证）
	router.GET("/api/projects", handler.ListProjects)
	router.GET("/api/projects/:id", handler.GetProject)

	events := router.Group("/api/events").Use(middleware.RequireAuth())
	{
		events.GET("", handler.ListEvents)
		events.GET("/:id", handler.GetEvent)
		events.POST("", middleware.RequireRole(model.RoleSuperAdmin), handler.CreateEvent)
		events.PUT("/:id", middleware.RequireRole(model.RoleSuperAdmin), handler.UpdateEvent)
		events.DELETE("/:id", middleware.RequireRole(model.RoleSuperAdmin), handler.DeleteEvent)
		events.POST("/:id/signup", handler.SignUpEvent)
		events.GET("/:id/signup", handler.GetEventSignup)
		events.DELETE("/:id/signup", handler.CancelEventSignup)
		events.POST("/signups/:id/confirm", middleware.RequireRole(model.RoleSuperAdmin), handler.ConfirmEventSignup)
		events.GET("/:id/signups", middleware.RequireRole(model.RoleSuperAdmin), handler.ListEventSignups)
	}

	recruitments := router.Group("/api/recruitments").Use(middleware.RequireAuth())
	{
		recruitments.GET("", handler.ListRecruitments)
		recruitments.GET("/:id", handler.GetRecruitment)
		recruitments.POST("", handler.CreateRecruitment)
		recruitments.PUT("/:id", handler.UpdateRecruitment)
		recruitments.DELETE("/:id", handler.DeleteRecruitment)
		recruitments.POST("/:id/solve", handler.SolveRecruitment)
		recruitments.POST("/:id/invalidate", handler.InvalidateRecruitment)
		recruitments.POST("/:id/apply", handler.ApplyRecruitment)
		recruitments.GET("/:id/responses", handler.GetRecruitmentResponses)
		recruitments.POST("/:id/responses/:response_id/accept", handler.AcceptRecruitmentResponse)
		recruitments.POST("/:id/responses/:response_id/reject", handler.RejectRecruitmentResponse)
	}

	responses := router.Group("/api/responses").Use(middleware.RequireAuth())
	{
		responses.POST("", handler.CreateResponse)
		responses.GET("/:id", handler.GetResponse)
		responses.PUT("/:id", handler.UpdateResponse)
		responses.DELETE("/:id", handler.DeleteResponse)
		responses.POST("/:id/accept", handler.AcceptResponse)
		responses.POST("/:id/reject", handler.RejectResponse)
		responses.GET("/my", handler.GetMyResponses)
		responses.POST("/:id/invalidate", handler.InvalidateResponse)
	}

	resources := router.Group("/api/resources").Use(middleware.RequireAuth())
	{
		resources.GET("", middleware.RequireRole(model.RoleStudent), handler.ListResourceOpportunities)
		resources.GET("/:id", middleware.RequireRole(model.RoleStudent), handler.GetResourceOpportunity)
		resources.POST("", middleware.RequireRole(model.RolePartner, model.RoleAdmin), handler.CreateResourceOpportunity)
		resources.PUT("/:id", middleware.RequireRole(model.RolePartner, model.RoleAdmin), handler.UpdateResourceOpportunity)
		resources.DELETE("/:id", middleware.RequireRole(model.RolePartner, model.RoleAdmin), handler.DeleteResourceOpportunity)
	}

	return router
}
