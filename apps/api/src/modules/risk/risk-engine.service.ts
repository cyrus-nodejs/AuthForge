import { Injectable } from '@nestjs/common';
import {
  RiskContext,
  RiskDecision,
  RiskLevel,
  RiskResult,
} from './risk.types';

@Injectable()
export class RiskEngineService {
  evaluate(context: RiskContext): RiskResult {
    let score = 0;

    if (!context.userExists) {
      score += 10;
    }

    if (!context.fingerprintKnown) {
      score += 25;
    }

    if (context.ipVelocity >= 10) {
      score += 30;
    } else if (context.ipVelocity >= 5) {
      score += 15;
    }

    if (context.failedAttempts >= 3) {
      score += 25;
    }

    if (context.tokenAnomaly) {
      score += 40;
    }

    if (context.sessionAnomaly) {
      score += 35;
    }

    if (score >= 80) {
      return {
        level: RiskLevel.CRITICAL,
        decision: RiskDecision.DENY,
        requiredMethods: ['recovery'],
      };
    }

    if (score >= 55) {
      return {
        level: RiskLevel.HIGH,
        decision: RiskDecision.STEP_UP,
        requiredMethods: [
          'magic_link',
          'otp',
          'passkey',
        ],
      };
    }

    if (score >= 30) {
      return {
        level: RiskLevel.MEDIUM,
        decision: RiskDecision.CHALLENGE,
        requiredMethods: ['magic_link'],
      };
    }

    return {
      level: RiskLevel.LOW,
      decision: RiskDecision.ALLOW,
      requiredMethods: ['passkey'],
    };
  }
}