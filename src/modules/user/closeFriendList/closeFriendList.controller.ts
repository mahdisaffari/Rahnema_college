import { Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { getCloseFriendList } from './closeFriendList.service';
import { CloseFriendListResponse } from './closeFriendList.types';
import { handleError } from '../../../utils/errorHandler';

export async function getCloseFriendListHandler(req: AuthRequest, res: Response<CloseFriendListResponse>) {
    try {
        const userId = req.user!.id;
        const closeFriends = await getCloseFriendList(userId);
        return res.json({
            success: true,
            message: closeFriends.length ? 'لیست دوستان نزدیک دریافت شد' : 'لیست دوستان نزدیک خالی است',
            data: closeFriends,
        });
    } catch (error) {
        return handleError(error, res, 'خطا در دریافت لیست دوستان نزدیک');
    }
}