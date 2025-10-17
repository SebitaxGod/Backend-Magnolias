import { PartialType } from '@nestjs/swagger';
import { CreateCargoDto } from './create-Cargo.dto';

export class UpdateCargoDto extends PartialType(CreateCargoDto) {}
