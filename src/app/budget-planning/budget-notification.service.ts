import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BudgetAlert,
  BudgetAlertDocument,
  BudgetAlertScope,
  BudgetAlertType,
} from './models/budget-alert.model';
import { BudgetAlertResponseDto } from './dto/budget-alert-response.dto';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';

type CreateAlertPayload = {
  userId: string;
  budgetPlanId: string;
  scope: BudgetAlertScope;
  scopeRefId?: string | null;
  type: BudgetAlertType;
  spentAmount: number;
  limitAmount: number;
  percentage: number;
  currency: CURRENCIES;
  expenseId?: string | null;
  triggeredAt: Date;
};

@Injectable()
export class BudgetNotificationService {
  private readonly logger = new Logger(BudgetNotificationService.name);

  constructor(
    @InjectModel(BudgetAlert.name)
    private readonly budgetAlertModel: Model<BudgetAlertDocument>,
  ) {}

  async createAlert(payload: CreateAlertPayload): Promise<BudgetAlertResponseDto | null> {
    try {
      const result = await this.budgetAlertModel.findOneAndUpdate(
        {
          userId: payload.userId,
          budgetPlanId: payload.budgetPlanId,
          scope: payload.scope,
          scopeRefId: payload.scopeRefId ?? null,
          type: payload.type,
        },
        {
          $setOnInsert: {
            userId: payload.userId,
            budgetPlanId: payload.budgetPlanId,
            scope: payload.scope,
            scopeRefId: payload.scopeRefId ?? null,
            type: payload.type,
            triggeredAt: payload.triggeredAt,
          },
          $set: {
            spentAmount: payload.spentAmount,
            limitAmount: payload.limitAmount,
            percentage: Number(payload.percentage.toFixed(2)),
            currency: payload.currency,
            expenseId: payload.expenseId ?? null,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      return this.toResponseDto(result);
    } catch (error) {
      this.logger.error(
        `Failed to create budget alert (plan=${payload.budgetPlanId}, scope=${payload.scope}, type=${payload.type})`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  async listAlerts(userId: string, budgetPlanId?: string): Promise<BudgetAlertResponseDto[]> {
    const filter: Record<string, unknown> = { userId };

    if (budgetPlanId) {
      filter.budgetPlanId = budgetPlanId;
    }

    const alerts = await this.budgetAlertModel.find(filter).sort({ triggeredAt: -1 }).lean();

    return alerts.map((alert) => this.toResponseDto(alert)).filter(Boolean) as BudgetAlertResponseDto[];
  }

  async removeAlertsForPlan(budgetPlanId: string): Promise<number> {
    const result = await this.budgetAlertModel.deleteMany({ budgetPlanId }).exec();

    return result.deletedCount ?? 0;
  }

  private toResponseDto(document: BudgetAlert | BudgetAlertDocument | (BudgetAlert & { _id: string }) | null) {
    if (!document) {
      return null;
    }

    const plain = document instanceof this.budgetAlertModel ? document.toObject() : (document as BudgetAlert);

    return {
      id: plain._id.toString(),
      budgetPlanId: plain.budgetPlanId,
      scope: plain.scope,
      scopeRefId: plain.scopeRefId ?? null,
      type: plain.type,
      spentAmount: plain.spentAmount,
      limitAmount: plain.limitAmount,
      percentage: plain.percentage,
      currency: plain.currency,
      expenseId: plain.expenseId ?? null,
      triggeredAt: new Date(plain.triggeredAt).toISOString(),
    } as BudgetAlertResponseDto;
  }
}
