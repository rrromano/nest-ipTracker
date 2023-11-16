import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class StatisticsDocument extends Document {
  @Prop({ required: true, index: true })
  regionName: string;
  @Prop({ required: true, index: true })
  city: string;
  @Prop({ required: true, index: true })
  country: string;
  @Prop({ required: true, index: true })
  distanceToUsa: number;
}

export const StatisticsSchema =
  SchemaFactory.createForClass(StatisticsDocument);
