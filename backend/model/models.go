package model

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleStudent  UserRole = "student"
	RoleMentor   UserRole = "mentor"
	RoleInvestor UserRole = "investor"
	RolePartner  UserRole = "partner"
	RoleAdmin    UserRole = "admin"
	RoleSuperAdmin UserRole = "super_admin"
)

type UserStatus string

const (
	UserStatusPending  UserStatus = "pending"
	UserStatusApproved UserStatus = "approved"
	UserStatusRejected UserStatus = "rejected"
)

type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Username        string     `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Email           string     `gorm:"uniqueIndex;size:100;not null" json:"email"`
	Password        string     `gorm:"size:255;not null" json:"-"`
	Nickname        string     `gorm:"size:50" json:"nickname"`
	Avatar          string     `gorm:"size:255" json:"avatar"`
	Phone           string     `gorm:"size:20" json:"phone"`
	Role            UserRole   `gorm:"type:varchar(20);not null;default:'student'" json:"role"`
	RequestedRole   UserRole   `gorm:"type:varchar(20);default:''" json:"requested_role"`
	RoleStatus      UserStatus `gorm:"type:varchar(20);not null;default:'approved'" json:"role_status"`
	Organization    string     `gorm:"size:255" json:"organization"`
	Expertise       string     `gorm:"type:text" json:"expertise"`
	InvestmentFocus string     `gorm:"type:text" json:"investment_focus"`
	ServiceArea     string     `gorm:"type:text" json:"service_area"`
	ApplicationNote string     `gorm:"type:text" json:"application_note"`
	IsActive        bool       `gorm:"default:true" json:"is_active"`
}

type TeamStage string

const (
	TeamStageSeedPlan TeamStage = "seed_plan"
	TeamStageEarly    TeamStage = "early"
	TeamStageGrowth   TeamStage = "growth"
)

type TeamStatus string

const (
	TeamStatusPending  TeamStatus = "pending"
	TeamStatusApproved TeamStatus = "approved"
	TeamStatusRejected TeamStatus = "rejected"
)

type Team struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name        string     `gorm:"size:100;not null" json:"name"`
	Description string     `gorm:"type:text" json:"description"`
	Logo        string     `gorm:"size:255" json:"logo"`
	Status      TeamStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	Stage       TeamStage  `gorm:"type:varchar(20);not null;default:'seed_plan'" json:"stage"`

	OwnerID uint   `gorm:"not null;index" json:"owner_id"`
	Owner   *User  `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Members []User `gorm:"many2many:team_members;" json:"members,omitempty"`

	ReviewNote string     `gorm:"type:text" json:"review_note"`
	ReviewedBy *uint      `json:"reviewed_by"`
	ReviewedAt *time.Time `json:"reviewed_at"`
}

type TeamInvitationStatus string

const (
	TeamInvitationStatusPending  TeamInvitationStatus = "pending"
	TeamInvitationStatusAccepted TeamInvitationStatus = "accepted"
	TeamInvitationStatusRejected TeamInvitationStatus = "rejected"
)

type TeamMemberInvitation struct {
	ID            uint                 `gorm:"primarykey" json:"id"`
	CreatedAt     time.Time            `json:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at"`
	TeamID        uint                 `gorm:"not null;index" json:"team_id"`
	Team          *Team                `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	InvitedUserID uint                 `gorm:"not null;index" json:"invited_user_id"`
	InvitedUser   *User                `gorm:"foreignKey:InvitedUserID" json:"invited_user,omitempty"`
	InviterID     uint                 `gorm:"not null;index" json:"inviter_id"`
	Inviter       *User                `gorm:"foreignKey:InviterID" json:"inviter,omitempty"`
	Status        TeamInvitationStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	ReviewedBy    *uint                `json:"reviewed_by"`
	ReviewedAt    *time.Time           `json:"reviewed_at"`
}

type TeamJoinRequestStatus string

const (
	TeamJoinRequestStatusPending  TeamJoinRequestStatus = "pending"
	TeamJoinRequestStatusAccepted TeamJoinRequestStatus = "accepted"
	TeamJoinRequestStatusRejected TeamJoinRequestStatus = "rejected"
)

type TeamJoinRequest struct {
	ID         uint                  `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time             `json:"created_at"`
	UpdatedAt  time.Time             `json:"updated_at"`
	TeamID     uint                  `gorm:"not null;index" json:"team_id"`
	Team       *Team                 `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	UserID     uint                  `gorm:"not null;index" json:"user_id"`
	User       *User                 `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Status     TeamJoinRequestStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	ReviewedBy *uint                 `json:"reviewed_by"`
	ReviewedAt *time.Time            `json:"reviewed_at"`
}

type ApplicationStatus string

const (
	AppStatusDraft     ApplicationStatus = "draft"
	AppStatusPending   ApplicationStatus = "pending"
	AppStatusApproved  ApplicationStatus = "approved"
	AppStatusRejected  ApplicationStatus = "rejected"
	AppStatusCancelled ApplicationStatus = "cancelled"
)

type StartupApplication struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title        string            `gorm:"size:200;not null" json:"title"`
	Description  string            `gorm:"type:text" json:"description"`
	BusinessPlan string            `gorm:"type:text" json:"business_plan"`
	Status       ApplicationStatus `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`

	UserID     uint       `gorm:"not null;index" json:"user_id"`
	User       *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReviewNote string     `gorm:"type:text" json:"review_note"`
	ReviewedBy *uint      `json:"reviewed_by"`
	ReviewedAt *time.Time `json:"reviewed_at"`
}

type ProjectStatus string

const (
	ProjStatusDraft           ProjectStatus = "draft"
	ProjStatusPendingOnline   ProjectStatus = "pending_online"
	ProjStatusOnline          ProjectStatus = "online"
	ProjStatusRejectedOnline  ProjectStatus = "rejected_online"
	ProjStatusPendingOffline  ProjectStatus = "pending_offline"
	ProjStatusOffline         ProjectStatus = "offline"
	ProjStatusRejectedOffline ProjectStatus = "rejected_offline"
	ProjStatusInvalid         ProjectStatus = "invalid"
)

type Project struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title       string        `gorm:"size:200;not null" json:"title"`
	Description string        `gorm:"type:text" json:"description"`
	Content     string        `gorm:"type:text" json:"content"`
	CoverImage  string        `gorm:"size:255" json:"cover_image"`
	Status      ProjectStatus `gorm:"type:varchar(30);not null;default:'draft'" json:"status"`
	IsPublic    bool          `gorm:"default:true" json:"is_public"`
	Industry    string        `gorm:"size:100" json:"industry"`
	FundingNeed string        `gorm:"size:100" json:"funding_need"`

	TeamID    uint   `gorm:"not null;index" json:"team_id"`
	Team      *Team  `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	Tags      string `gorm:"size:500" json:"tags"`
	ViewCount uint   `gorm:"default:0" json:"view_count"`
}

type RecruitmentStatus string

const (
	RecruitStatusActive  RecruitmentStatus = "active"
	RecruitStatusSolved  RecruitmentStatus = "solved"
	RecruitStatusInvalid RecruitmentStatus = "invalid"
)

type Recruitment struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title        string            `gorm:"size:200;not null" json:"title"`
	Description  string            `gorm:"type:text" json:"description"`
	Requirements string            `gorm:"type:text" json:"requirements"`
	Status       RecruitmentStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`

	TeamID   uint       `gorm:"not null;index" json:"team_id"`
	Team     *Team      `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	Position string     `gorm:"size:100" json:"position"`
	Salary   string     `gorm:"size:100" json:"salary"`
	Deadline *time.Time `json:"deadline"`
}

type ResponseStatus string

const (
	RespStatusPending  ResponseStatus = "pending"
	RespStatusAccepted ResponseStatus = "accepted"
	RespStatusRejected ResponseStatus = "rejected"
	RespStatusInvalid  ResponseStatus = "invalid"
)

type RecruitmentResponse struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	CoverLetter string         `gorm:"type:text" json:"cover_letter"`
	Resume      string         `gorm:"size:255" json:"resume"`
	Status      ResponseStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`

	RecruitmentID uint         `gorm:"not null;index" json:"recruitment_id"`
	Recruitment   *Recruitment `gorm:"foreignKey:RecruitmentID" json:"recruitment,omitempty"`
	UserID        uint         `gorm:"not null;index" json:"user_id"`
	User          *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReviewNote    string       `gorm:"type:text" json:"review_note"`
}

type ResourceStatus string

const (
	ResourceStatusActive  ResourceStatus = "active"
	ResourceStatusClosed  ResourceStatus = "closed"
	ResourceStatusInvalid ResourceStatus = "invalid"
)

type ResourceOpportunity struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title        string         `gorm:"size:200;not null" json:"title"`
	Description  string         `gorm:"type:text" json:"description"`
	ResourceType string         `gorm:"size:100" json:"resource_type"`
	Tags         string         `gorm:"size:255" json:"tags"`
	Contact      string         `gorm:"size:255" json:"contact"`
	Status       ResourceStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`

	OwnerID uint  `gorm:"not null;index" json:"owner_id"`
	Owner   *User `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
}

type RequestStatus string

const (
	RequestStatusPending  RequestStatus = "pending"
	RequestStatusAccepted RequestStatus = "accepted"
	RequestStatusRejected RequestStatus = "rejected"
	RequestStatusInvalid  RequestStatus = "invalid"
)

type ProjectFavorite struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	UserID    uint     `gorm:"not null;index;uniqueIndex:idx_project_favorite_user_project" json:"user_id"`
	User      *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ProjectID uint     `gorm:"not null;index;uniqueIndex:idx_project_favorite_user_project" json:"project_id"`
	Project   *Project `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
}

type ProjectBPRequest struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	ProjectID  uint          `gorm:"not null;index" json:"project_id"`
	Project    *Project      `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	UserID     uint          `gorm:"not null;index" json:"user_id"`
	User       *User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Status     RequestStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	ReviewNote string        `gorm:"type:text" json:"review_note"`
}

type ProjectConnectionRequest struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	ProjectID  uint          `gorm:"not null;index" json:"project_id"`
	Project    *Project      `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	UserID     uint          `gorm:"not null;index" json:"user_id"`
	User       *User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Message    string        `gorm:"type:text" json:"message"`
	Status     RequestStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	ReviewNote string        `gorm:"type:text" json:"review_note"`
}

type EventStatus string

const (
	EventStatusActive    EventStatus = "active"
	EventStatusClosed    EventStatus = "closed"
	EventStatusCancelled EventStatus = "cancelled"
)

type Event struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title       string      `gorm:"size:200;not null" json:"title"`
	Description string      `gorm:"type:text" json:"description"`
	EventType   string      `gorm:"size:100" json:"event_type"`
	Location    string      `gorm:"size:255" json:"location"`
	StartAt     time.Time   `json:"start_at"`
	EndAt       time.Time   `gorm:"end_at"`
	Status      EventStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`

	OwnerID uint  `gorm:"not null;index" json:"owner_id"`
	Owner   *User `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
}

type EventSignup struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	EventID uint   `gorm:"not null;index;uniqueIndex:idx_event_signup_event_user" json:"event_id"`
	Event   *Event `gorm:"foreignKey:EventID" json:"event,omitempty"`
	UserID  uint   `gorm:"not null;index;uniqueIndex:idx_event_signup_event_user" json:"user_id"`
	User    *User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
