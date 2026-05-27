package service

import (
	"errors"
	"time"

	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/repository"
)

func CreatePendingTeam(user *model.User, name, description, logo string) (*model.Team, error) {
	if user.Role != model.RoleStudent {
		return nil, errors.New("只有学生可以创建团队")
	}

	hasApproved, err := repository.HasApprovedApplicationByUserID(user.ID)
	if err != nil {
		return nil, err
	}
	if !hasApproved {
		return nil, errors.New("需要先通过创业申请审批才能创建团队")
	}

	team := &model.Team{
		Name:        name,
		Description: description,
		Logo:        logo,
		Status:      model.TeamStatusPending,
		OwnerID:     user.ID,
	}

	if err := repository.CreateTeam(team); err != nil {
		return nil, err
	}

	return team, nil
}

func ApproveTeam(teamID uint, approver *model.User, note string) (*model.Team, error) {
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		return nil, err
	}

	team.Status = model.TeamStatusApproved
	team.ReviewNote = note
	team.ReviewedBy = &approver.ID
	now := time.Now()
	team.ReviewedAt = &now

	if err := repository.UpdateTeam(team); err != nil {
		return nil, err
	}

	return team, nil
}

func RejectTeam(teamID uint, approver *model.User, note string) (*model.Team, error) {
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		return nil, err
	}

	team.Status = model.TeamStatusRejected
	team.ReviewNote = note
	team.ReviewedBy = &approver.ID
	now := time.Now()
	team.ReviewedAt = &now

	if err := repository.UpdateTeam(team); err != nil {
		return nil, err
	}

	return team, nil
}

func InviteTeamMember(teamID uint, invitedUserID uint, operator *model.User) (*model.TeamMemberInvitation, error) {
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		return nil, err
	}

	if operator.Role != model.RoleAdmin && operator.ID != team.OwnerID {
		return nil, errors.New("只有团队拥有者或管理员可以邀请成员")
	}

	if invitedUserID == team.OwnerID {
		return nil, errors.New("不能邀请团队拥有者")
	}

	isMember, err := repository.IsUserTeamMember(teamID, invitedUserID)
	if err != nil {
		return nil, err
	}
	if isMember {
		return nil, errors.New("用户已是团队成员")
	}

	hasPending, err := repository.HasPendingTeamInvitation(teamID, invitedUserID)
	if err != nil {
		return nil, err
	}
	if hasPending {
		return nil, errors.New("该用户已有待处理的邀请")
	}

	return repository.CreateTeamInvitation(teamID, invitedUserID, operator.ID)
}

func ApproveTeamInvitation(inviteID uint, operator *model.User) (*model.TeamMemberInvitation, error) {
	invitation, err := repository.GetTeamInvitationByID(inviteID)
	if err != nil {
		return nil, err
	}

	if invitation.Status != model.TeamInvitationStatusPending {
		return nil, errors.New("该邀请已处理")
	}

	if operator.Role != model.RoleAdmin && operator.ID != invitation.InvitedUserID {
		return nil, errors.New("只有被邀请用户或管理员可以接受邀请")
	}

	if err := repository.AddTeamMember(invitation.TeamID, invitation.InvitedUserID); err != nil {
		return nil, err
	}

	invitation.Status = model.TeamInvitationStatusAccepted
	invitation.ReviewedBy = &operator.ID
	now := time.Now()
	invitation.ReviewedAt = &now
	if err := repository.UpdateTeamInvitation(invitation); err != nil {
		return nil, err
	}

	return invitation, nil
}

func RejectTeamInvitation(inviteID uint, operator *model.User) (*model.TeamMemberInvitation, error) {
	invitation, err := repository.GetTeamInvitationByID(inviteID)
	if err != nil {
		return nil, err
	}

	if invitation.Status != model.TeamInvitationStatusPending {
		return nil, errors.New("该邀请已处理")
	}

	if operator.Role != model.RoleAdmin && operator.ID != invitation.InvitedUserID {
		return nil, errors.New("只有被邀请用户或管理员可以拒绝邀请")
	}

	invitation.Status = model.TeamInvitationStatusRejected
	invitation.ReviewedBy = &operator.ID
	now := time.Now()
	invitation.ReviewedAt = &now
	if err := repository.UpdateTeamInvitation(invitation); err != nil {
		return nil, err
	}

	return invitation, nil
}

func RequestJoinTeam(teamID uint, user *model.User) (*model.TeamJoinRequest, error) {
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		return nil, err
	}

	if team.Status != model.TeamStatusApproved {
		return nil, errors.New("团队尚未通过审批，无法申请加入")
	}

	isMember, err := repository.IsUserTeamMember(teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if isMember {
		return nil, errors.New("你已经是该团队成员")
	}

	hasPending, err := repository.HasPendingJoinRequest(teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if hasPending {
		return nil, errors.New("你已有待处理的加入申请")
	}

	return repository.CreateTeamJoinRequest(teamID, user.ID)
}

func ApproveTeamJoinRequest(requestID uint, operator *model.User) (*model.TeamJoinRequest, error) {
	req, err := repository.GetTeamJoinRequestByID(requestID)
	if err != nil {
		return nil, err
	}

	if req.Status != model.TeamJoinRequestStatusPending {
		return nil, errors.New("该加入申请已处理")
	}

	team, err := repository.GetTeamByID(req.TeamID)
	if err != nil {
		return nil, err
	}

	if operator.Role != model.RoleAdmin && operator.ID != team.OwnerID {
		return nil, errors.New("只有团队拥有者或管理员可以审批加入申请")
	}

	if err := repository.AddTeamMember(req.TeamID, req.UserID); err != nil {
		return nil, err
	}

	req.Status = model.TeamJoinRequestStatusAccepted
	req.ReviewedBy = &operator.ID
	now := time.Now()
	req.ReviewedAt = &now
	if err := repository.UpdateTeamJoinRequest(req); err != nil {
		return nil, err
	}

	return req, nil
}

func RejectTeamJoinRequest(requestID uint, operator *model.User) (*model.TeamJoinRequest, error) {
	req, err := repository.GetTeamJoinRequestByID(requestID)
	if err != nil {
		return nil, err
	}

	if req.Status != model.TeamJoinRequestStatusPending {
		return nil, errors.New("该加入申请已处理")
	}

	team, err := repository.GetTeamByID(req.TeamID)
	if err != nil {
		return nil, err
	}

	if operator.Role != model.RoleAdmin && operator.ID != team.OwnerID {
		return nil, errors.New("只有团队拥有者或管理员可以拒绝加入申请")
	}

	req.Status = model.TeamJoinRequestStatusRejected
	req.ReviewedBy = &operator.ID
	now := time.Now()
	req.ReviewedAt = &now
	if err := repository.UpdateTeamJoinRequest(req); err != nil {
		return nil, err
	}

	return req, nil
}

func TransferTeamOwnership(teamID uint, newOwnerID uint, operator *model.User) (*model.Team, error) {
	team, err := repository.GetTeamByID(teamID)
	if err != nil {
		return nil, err
	}

	if operator.ID != team.OwnerID && operator.Role != model.RoleAdmin {
		return nil, errors.New("只有当前团队拥有者或管理员可以转移所有权")
	}

	if team.OwnerID == newOwnerID {
		return team, nil
	}

	isMember, err := repository.IsUserTeamMember(teamID, newOwnerID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("新拥有者必须是团队成员")
	}

	if err := repository.TransferTeamOwnership(teamID, newOwnerID); err != nil {
		return nil, err
	}

	return repository.GetTeamByID(teamID)
}
