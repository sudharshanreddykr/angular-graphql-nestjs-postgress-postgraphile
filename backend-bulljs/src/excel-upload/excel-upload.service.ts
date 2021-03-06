import { Injectable } from '@nestjs/common';
import { CreateExcelUploadInput } from './dto/create-excel-upload.input';
import { UpdateExcelUploadInput } from './dto/update-excel-upload.input';
import * as reader from 'xlsx';
@Injectable()
export class ExcelUploadService {
  create(createExcelUploadInput: CreateExcelUploadInput) {
    return 'This action adds a new excelUpload';
  }
  read(filename: string) {
    const file = reader.readFile(`./uploads/${filename}`);
    const sheets = file.SheetNames;
    let data = [];
    for (let i = 0; i < sheets.length; i++) {
      const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
      temp.forEach((res) => {
        data.push(res);
      });
    }
    console.log('_______', data);
    for (let i = 0; i < data.length; i++) {
      console.log('________', data[i].mohan);
    }
  }

  findAll() {
    return `This action returns all excelUpload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} excelUpload`;
  }

  update(id: number, updateExcelUploadInput: UpdateExcelUploadInput) {
    return `This action updates a #${id} excelUpload`;
  }

  remove(id: number) {
    return `This action removes a #${id} excelUpload`;
  }
}
