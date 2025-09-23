import { Request, Response } from 'express';
import { SearchPostsQuery, SearchPostsResponse } from './searchByPost.types';
import { SearchByPostService } from './searchByPost.service';
import { SearchPostsSchema, validateSearchPosts } from '../../../../utils/validators';
import { handleError } from '../../../../utils/errorHandler';
import { AuthRequest } from '../../../auth/auth.middleware';

const searchByPostService = new SearchByPostService();

export class SearchByPostController {
    async getPostsByHashtag(req: AuthRequest, res: Response<SearchPostsResponse>) {
        try {
            const { q, page, limit } = SearchPostsSchema.parse(req.query);
            const viewerId = req.user?.id;

            const validation = await validateSearchPosts({ q, page, limit });
            if (validation.q || validation.page || validation.limit) {
                return handleError(validation, res, 'خطا در اعتبارسنجی ورودی‌ها', 400);
            }

            const result = await searchByPostService.searchPostsByHashtag({ q, page, limit, viewerId });

            return res.status(200).json(result);
        } catch (error) {
            return handleError(error, res, 'خطا در جستجوی پست‌ها');
        }
    }
}