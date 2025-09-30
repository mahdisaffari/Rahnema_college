import { Request, Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';
import { sendFollowRequest, acceptFollowRequest, rejectFollowRequest, getPendingFollowRequests, removeFollower } from './follow.service';
import { FollowRequestResponse, PendingRequestsResponse, RemoveFollowerResponse } from './follow.types';

export async function followUserHandler(req: AuthRequest, res: Response<FollowRequestResponse>) { 
  try {
    const followerId = req.user!.id;
    const targetUsername = req.params.username;
    const result = await sendFollowRequest(followerId, targetUsername);
    const message = result.status === 'pending' ? 'درخواست فالو ارسال شد' :
                    result.status === 'accepted' ? 'فالو شد' :
                    result.status === 'followed' ? 'فالو شد' :
                    result.status === 'unfollowed' ? 'انفالو شد' : 'عملیات انجام شد';

    // Map result.status to allowed values
    let mappedStatus: "pending" | "accepted" | "rejected" | undefined;
    if (result.status === "pending") mappedStatus = "pending";
    else if (result.status === "accepted" || result.status === "followed") mappedStatus = "accepted";
    else if (result.status === "rejected" || result.status === "unfollowed") mappedStatus = "rejected";
    else mappedStatus = undefined;

    return res.json({ success: true, message, data: { ...result, status: mappedStatus } });
  } catch (error) {
    return handleError(error, res, 'خطا در مدیریت فالو');
  }
}

export async function acceptFollowRequestHandler(req: AuthRequest, res: Response<FollowRequestResponse>) {
  try {
    const targetId = req.user!.id;
    const { requestId } = req.params;
    await acceptFollowRequest(requestId, targetId);
    return res.json({ success: true, message: 'درخواست پذیرفته شد', data: { requestSent: true, status: 'accepted' } });
  } catch (error) {
    return handleError(error, res, 'خطا در پذیرش درخواست');
  }
}

export async function rejectFollowRequestHandler(req: AuthRequest, res: Response<FollowRequestResponse>) {
  try {
    const targetId = req.user!.id;
    const { requestId } = req.params;
    await rejectFollowRequest(requestId, targetId);
    return res.json({ success: true, message: 'درخواست رد شد', data: { requestSent: false, status: 'rejected' } });
  } catch (error) {
    return handleError(error, res, 'خطا در رد درخواست');
  }
}

export async function getPendingFollowRequestsHandler(req: AuthRequest, res: Response<PendingRequestsResponse>) {
  try {
    const targetId = req.user!.id;
    const requests = await getPendingFollowRequests(targetId);
    return res.json({ success: true, message: 'درخواست‌های در حال بررسی', data: requests });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت درخواست‌ها');
  }
}

export async function removeFollowerHandler(req: AuthRequest, res: Response<RemoveFollowerResponse>) {
  try {
    const followingId = req.user!.id;
    const followerUsername = req.params.username;
    const result = await removeFollower(followingId, followerUsername);
    return res.json({
      success: true,
      message: 'فالوور حذف شد',
      data: {
        removedFollower: result!.removedFollower,
      },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در حذف فالوور');
  }
}