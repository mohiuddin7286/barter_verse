import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/error.middleware';

export const createProposalSchema = z.object({
  title: z.string().min(5).max(180),
  summary: z.string().min(20).max(2000),
  category: z.string().min(2).max(60).default('Community'),
  endsAt: z.string().datetime().optional(),
});

export const voteProposalSchema = z.object({
  vote: z.enum(['yes', 'no']),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type VoteProposalInput = z.infer<typeof voteProposalSchema>;

export type GovernanceProposal = {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: 'active' | 'closed';
  createdAt: string;
  endsAt: string | null;
  createdBy: {
    id: string;
    username: string | null;
    display_name: string | null;
  };
  votes: {
    yes: number;
    no: number;
    total: number;
    yesPercent: number;
  };
};

type ProposalPayload = {
  type: 'governance_proposal';
  title: string;
  summary: string;
  category: string;
  status: 'active' | 'closed';
  endsAt: string | null;
};

type VotePayload = {
  type: 'governance_vote';
  vote: 'yes' | 'no';
  weight: number;
};

const asProposalPayload = (raw: string | null): ProposalPayload | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ProposalPayload>;
    if (parsed?.type !== 'governance_proposal') return null;
    if (!parsed.title || !parsed.summary || !parsed.category || !parsed.status) return null;
    return {
      type: 'governance_proposal',
      title: parsed.title,
      summary: parsed.summary,
      category: parsed.category,
      status: parsed.status,
      endsAt: parsed.endsAt ?? null,
    };
  } catch {
    return null;
  }
};

const asVotePayload = (raw: string | null): VotePayload | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<VotePayload>;
    if (parsed?.type !== 'governance_vote') return null;
    if (!parsed.vote || typeof parsed.weight !== 'number') return null;
    return {
      type: 'governance_vote',
      vote: parsed.vote,
      weight: parsed.weight,
    };
  } catch {
    return null;
  }
};

const roundPercent = (value: number): number => Math.round(value * 100) / 100;

const buildVoteSummary = (votes: Array<{ details: string | null }>) => {
  const tally = votes.reduce(
    (acc, voteRow) => {
      const payload = asVotePayload(voteRow.details);
      if (!payload) return acc;
      if (payload.vote === 'yes') acc.yes += payload.weight;
      if (payload.vote === 'no') acc.no += payload.weight;
      return acc;
    },
    { yes: 0, no: 0 }
  );

  const total = tally.yes + tally.no;
  return {
    yes: tally.yes,
    no: tally.no,
    total,
    yesPercent: total > 0 ? roundPercent((tally.yes / total) * 100) : 0,
  };
};

export class GovernanceService {
  async createProposal(userId: string, input: CreateProposalInput): Promise<GovernanceProposal> {
    const validated = createProposalSchema.parse(input);

    const payload: ProposalPayload = {
      type: 'governance_proposal',
      title: validated.title,
      summary: validated.summary,
      category: validated.category,
      status: 'active',
      endsAt: validated.endsAt ?? null,
    };

    const proposal = await prisma.auditLog.create({
      data: {
        userId,
        action: 'governance_proposal',
        resource: 'governance',
        details: JSON.stringify(payload),
        status: 'success',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
          },
        },
      },
    });

    return {
      id: proposal.id,
      title: payload.title,
      summary: payload.summary,
      category: payload.category,
      status: payload.status,
      createdAt: proposal.createdAt.toISOString(),
      endsAt: payload.endsAt,
      createdBy: {
        id: proposal.user?.id ?? userId,
        username: proposal.user?.username ?? null,
        display_name: proposal.user?.display_name ?? null,
      },
      votes: {
        yes: 0,
        no: 0,
        total: 0,
        yesPercent: 0,
      },
    };
  }

  async listProposals(page: number, limit: number, status?: 'active' | 'closed') {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const rows = await prisma.auditLog.findMany({
      where: {
        action: 'governance_proposal',
        resource: 'governance',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    const total = await prisma.auditLog.count({
      where: {
        action: 'governance_proposal',
        resource: 'governance',
      },
    });

    const filtered = rows
      .map((row) => ({ row, payload: asProposalPayload(row.details) }))
      .filter((item): item is { row: (typeof rows)[number]; payload: ProposalPayload } => Boolean(item.payload))
      .filter((item) => !status || item.payload.status === status);

    const proposalIds = filtered.map((item) => item.row.id);
    const votes = proposalIds.length
      ? await prisma.auditLog.findMany({
          where: {
            action: 'governance_vote',
            resource: { in: proposalIds },
          },
          select: {
            resource: true,
            details: true,
          },
        })
      : [];

    const byProposal = new Map<string, Array<{ details: string | null }>>();
    for (const vote of votes) {
      if (!vote.resource) continue;
      const current = byProposal.get(vote.resource) ?? [];
      current.push({ details: vote.details });
      byProposal.set(vote.resource, current);
    }

    const proposals = filtered.map(({ row, payload }) => {
      const voteRows = byProposal.get(row.id) ?? [];
      return {
        id: row.id,
        title: payload.title,
        summary: payload.summary,
        category: payload.category,
        status: payload.status,
        createdAt: row.createdAt.toISOString(),
        endsAt: payload.endsAt,
        createdBy: {
          id: row.user?.id ?? row.userId ?? 'unknown',
          username: row.user?.username ?? null,
          display_name: row.user?.display_name ?? null,
        },
        votes: buildVoteSummary(voteRows),
      } satisfies GovernanceProposal;
    });

    return {
      proposals,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
      },
    };
  }

  async getProposalById(proposalId: string): Promise<GovernanceProposal> {
    const proposal = await prisma.auditLog.findFirst({
      where: {
        id: proposalId,
        action: 'governance_proposal',
        resource: 'governance',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new AppError(404, 'Proposal not found');
    }

    const payload = asProposalPayload(proposal.details);
    if (!payload) {
      throw new AppError(500, 'Malformed proposal payload');
    }

    const voteRows = await prisma.auditLog.findMany({
      where: {
        action: 'governance_vote',
        resource: proposalId,
      },
      select: { details: true },
    });

    return {
      id: proposal.id,
      title: payload.title,
      summary: payload.summary,
      category: payload.category,
      status: payload.status,
      createdAt: proposal.createdAt.toISOString(),
      endsAt: payload.endsAt,
      createdBy: {
        id: proposal.user?.id ?? proposal.userId ?? 'unknown',
        username: proposal.user?.username ?? null,
        display_name: proposal.user?.display_name ?? null,
      },
      votes: buildVoteSummary(voteRows),
    };
  }

  async voteOnProposal(userId: string, proposalId: string, voteInput: VoteProposalInput) {
    const validated = voteProposalSchema.parse(voteInput);

    const proposal = await prisma.auditLog.findFirst({
      where: {
        id: proposalId,
        action: 'governance_proposal',
        resource: 'governance',
      },
      select: {
        id: true,
        details: true,
      },
    });

    if (!proposal) {
      throw new AppError(404, 'Proposal not found');
    }

    const proposalPayload = asProposalPayload(proposal.details);
    if (!proposalPayload) {
      throw new AppError(500, 'Malformed proposal payload');
    }

    if (proposalPayload.status !== 'active') {
      throw new AppError(400, 'Voting is closed for this proposal');
    }

    if (proposalPayload.endsAt && new Date(proposalPayload.endsAt).getTime() < Date.now()) {
      throw new AppError(400, 'Proposal voting window has ended');
    }

    const existingVote = await prisma.auditLog.findFirst({
      where: {
        action: 'governance_vote',
        resource: proposalId,
        userId,
      },
      select: { id: true },
    });

    if (existingVote) {
      throw new AppError(409, 'You have already voted on this proposal');
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const weight = Math.max(1, user.coins);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'governance_vote',
        resource: proposalId,
        details: JSON.stringify({
          type: 'governance_vote',
          vote: validated.vote,
          weight,
        } satisfies VotePayload),
        status: 'success',
      },
    });

    const proposalWithVotes = await this.getProposalById(proposalId);

    return {
      proposalId,
      vote: validated.vote,
      weight,
      tally: proposalWithVotes.votes,
    };
  }

  async updateProposalStatus(proposalId: string, status: 'active' | 'closed') {
    const proposal = await prisma.auditLog.findFirst({
      where: {
        id: proposalId,
        action: 'governance_proposal',
        resource: 'governance',
      },
    });

    if (!proposal) {
      throw new AppError(404, 'Proposal not found');
    }

    const payload = asProposalPayload(proposal.details);
    if (!payload) {
      throw new AppError(500, 'Malformed proposal payload');
    }

    const updatedPayload: ProposalPayload = {
      ...payload,
      status,
    };

    await prisma.auditLog.update({
      where: { id: proposalId },
      data: {
        details: JSON.stringify(updatedPayload),
        status: 'success',
      },
    });

    return this.getProposalById(proposalId);
  }

  async getGovernanceOverview() {
    const proposalRows = await prisma.auditLog.findMany({
      where: {
        action: 'governance_proposal',
        resource: 'governance',
      },
      select: {
        id: true,
        details: true,
      },
    });

    const proposals = proposalRows
      .map((row) => asProposalPayload(row.details))
      .filter((payload): payload is ProposalPayload => Boolean(payload));

    const activeProposals = proposals.filter((proposal) => proposal.status === 'active').length;
    const closedProposals = proposals.filter((proposal) => proposal.status === 'closed').length;

    const votes = await prisma.auditLog.findMany({
      where: {
        action: 'governance_vote',
        resource: { in: proposalRows.map((row) => row.id) },
      },
      select: {
        userId: true,
        details: true,
      },
    });

    const uniqueVoters = new Set(votes.map((vote) => vote.userId).filter((userId): userId is string => Boolean(userId))).size;

    const tally = buildVoteSummary(votes.map((vote) => ({ details: vote.details })));

    return {
      activeProposals,
      closedProposals,
      totalProposals: proposals.length,
      totalVotes: tally.total,
      activeVoters: uniqueVoters,
      treasuryCoins: await prisma.profile.aggregate({ _sum: { coins: true } }).then((r) => r._sum.coins ?? 0),
      approvalRate: tally.yesPercent,
    };
  }
}
