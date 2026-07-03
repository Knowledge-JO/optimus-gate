import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BusinessesRepository } from './businesses.repository';

@Injectable()
export class BusinessesService {
  constructor(private readonly businessesRepository: BusinessesRepository) {}

  async createDefaultBusinessForUser(input: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    const existing = await this.businessesRepository.findDefaultBusinessForUser(
      input.userId,
    );

    if (existing) {
      return existing;
    }

    const displayName =
      [input.firstName, input.lastName].filter(Boolean).join(' ').trim() ||
      input.email.split('@')[0] ||
      'Business';
    const [business] = await this.businessesRepository.createBusiness({
      ownerUserId: input.userId,
      name: `${displayName}'s Business`,
      slug: this.createSlug(displayName),
    });
    await this.businessesRepository.createMember({
      businessId: business.id,
      userId: input.userId,
      role: 'owner',
    });

    return business;
  }

  async getDefaultBusinessForUser(userId: string) {
    const business =
      await this.businessesRepository.findDefaultBusinessForUser(userId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async getBusinessForUser(userId: string, businessId: string) {
    const [business] = await this.businessesRepository.findBusinessForUser(
      userId,
      businessId,
    );

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  upsertBusinessCustomer(input: {
    businessId: string;
    externalCustomerId: string;
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.businessesRepository.upsertBusinessCustomer({
      businessId: input.businessId,
      externalCustomerId: input.externalCustomerId,
      email: input.email,
      name: input.name,
      phone: input.phone,
      metadata: input.metadata ?? {},
    });
  }

  private createSlug(value: string) {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return `${normalized || 'business'}-${randomUUID().slice(0, 8)}`;
  }
}
