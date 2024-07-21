import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFamilyBudgetDto } from './dto/family-budget-input.dto';
import { UpdateFamilyBudgetDto } from './dto/family-budget-update.dto';
import { FamilyBudget, FamilyBudgetDocument } from './models/family-budget.model';

@Injectable()
export class FamilyBudgetService {
  constructor(@InjectModel(FamilyBudget.name) private familyBudgetModel: Model<FamilyBudgetDocument>) {}

  async create(createFamilyBudgetDto: CreateFamilyBudgetDto, userId: string): Promise<FamilyBudget> {
    const existingFamilyBudget = await this.familyBudgetModel.findOne({ name: createFamilyBudgetDto.name }).exec();

    if (existingFamilyBudget) {
      throw new BadRequestException(`FamilyBudget with name ${createFamilyBudgetDto.name} already exists`);
    }

    const createdFamilyBudget = new this.familyBudgetModel({ ...createFamilyBudgetDto, ownerId: userId });

    const savedFamilyBudget = await createdFamilyBudget.save();

    return savedFamilyBudget.toObject({ versionKey: false });
  }

  async findAll(userId: string): Promise<FamilyBudget[]> {
    return this.familyBudgetModel
      .find({ $or: [{ ownerId: userId }, { members: userId }] })
      .select('-__v')
      .exec();
  }

  async findOne(id: string, userId: string): Promise<FamilyBudget> {
    const familyBudget = await this.familyBudgetModel
      .findOne({ _id: id, $or: [{ ownerId: userId }, { members: userId }] })
      .exec();

    if (!familyBudget) {
      throw new NotFoundException(`FamilyBudget with id ${id} not found`);
    }

    return familyBudget;
  }

  async update(id: string, updateFamilyBudgetDto: UpdateFamilyBudgetDto, userId: string): Promise<FamilyBudget> {
    const updatedFamilyBudget = await this.familyBudgetModel
      .findOneAndUpdate({ _id: id, ownerId: userId }, updateFamilyBudgetDto, { new: true })
      .exec();

    if (!updatedFamilyBudget) {
      throw new NotFoundException(`FamilyBudget with id ${id} not found`);
    }

    return updatedFamilyBudget;
  }

  async remove(id: string, userId: string): Promise<FamilyBudget> {
    const deletedFamilyBudget = await this.familyBudgetModel.findOneAndDelete({ _id: id, ownerId: userId }).exec();

    if (!deletedFamilyBudget) {
      throw new NotFoundException(`FamilyBudget with id ${id} not found`);
    }

    return deletedFamilyBudget;
  }
}
