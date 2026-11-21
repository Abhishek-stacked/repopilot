import { Repository, UsageLog } from '../models/index.js';

export async function generateTests(req, res, next) {
  try {
    const { id } = req.params;
    const { functionName = 'verifyAccessToken', framework = 'jest' } = req.body;

    const repo = await Repository.findOne({ where: { id, userId: req.user.id } });
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found.' });
    }

    const testCode = `import { ${functionName} } from '../src/auth/jwt';
import jwt from 'jsonwebtoken';

describe('${functionName} middleware tests', () => {
  let mockReq: any;
  let mockRes: any;
  let nextFn: any;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFn = jest.fn();
  });

  test('should return 401 when Authorization header is missing', async () => {
    await ${functionName}(mockReq, mockRes, nextFn);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  test('should return 401 with TOKEN_EXPIRED on expired JWT', async () => {
    mockReq.headers = { authorization: 'Bearer expired.token.sample' };
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      const err: any = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    await ${functionName}(mockReq, mockRes, nextFn);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'TOKEN_EXPIRED' }));
  });
});`;

    await UsageLog.create({
      userId: req.user.id,
      action: 'generate_tests',
      repositoryId: repo.id,
      tokensUsed: 220,
    });

    return res.json({
      repositoryId: repo.id,
      functionName,
      framework,
      generatedTests: testCode,
      missingEdgeCases: [
        'Missing Authorization Header',
        'Expired Token Handling',
        'Malformed Bearer Format',
      ],
    });
  } catch (err) {
    next(err);
  }
}
