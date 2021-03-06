import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Student } from 'src/app/Student';
const GET_STUDENTS = gql`
  query {
    findAllStudents {
      id
      name
      email
      dateofbirth
      age
    }
  }
`;
const DELETE = gql`
  mutation ($studentId: String!) {
    removeStudent(id: $studentId) {
      __typename
    }
  }
`;

const CREATE_STUDENT = gql`
  mutation ($name: String!, $email: String!, $dateofbirth: DateTime!) {
    createStudent(
      createStudentInput: {
        name: $name
        email: $email
        dateofbirth: $dateofbirth
      }
    ) {
      id
      name
      email
      dateofbirth
      age
    }
  }
`;
// const UPDATE_STUDENT = gql`
//   mutation (
//     $id: String!
//     $name: String!
//     $email: String!
//     $dateofbirth: DateTime!
//   ) {
//     updateStudent(
//       updateStudentInput: {
//         id: $id
//         name: $name
//         email: $email
//         dateofbirth: $dateofbirth
//       }
//     ) {
//       age
//       name
//       email
//       dateofbirth
//       #typename
//     }
//   }
// `;

const UPDATE_STUDENT = gql`
  mutation (
    $studentId: String!
    $names: String!
    $email: String!
    $dateofbirth: DateTime!
  ) {
    updateStudent(
      updateStudentInput: {
        id: $studentId
        name: $names
        email: $email
        dateofbirth: $dateofbirth
      }
    ) {
      age
      name
      email
      dateofbirth
    }
  }
`;
@Component({
  selector: 'app-student-table',
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
})
export class StudentTableComponent implements OnInit {
  public gridView!: GridDataResult;
  public pageSize = 10;
  public skip = 0;
  editedRowIndex: number = 0;
  editRow: any;
  public opened = false;
  items: Student[] = [];
  form!: FormGroup;
  userData = {
    name: '',
    email: '',
    dateofbirth: '',
  };
  id!: string;
  age!: number;
  public uploadRemoveUrl = 'removeUrl';
  public uploadSaveUrl = 'saveUrl';
  update: boolean = false;
  constructor(private apollo: Apollo) {
    this.loadItems();
    this.form = new FormGroup({
      name: new FormControl(this.userData.name, [Validators.required]),
      email: new FormControl(this.userData.email, [Validators.required]),
      dateofbirth: new FormControl(this.userData.dateofbirth, [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.apollo
      .watchQuery<any>({
        query: GET_STUDENTS,
      })
      .valueChanges.subscribe(({ data, loading }) => {
        this.items = data.findAllStudents;
        console.log(this.items);
      });
  }
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadItems();
  }

  private loadItems(): void {
    this.gridView = {
      data: this.items.slice(this.skip, this.skip + this.pageSize),
      total: this.items.length,
    };
  }
  public close() {
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }
  removeHandler(id: any) {
    this.apollo
      .mutate({
        mutation: DELETE,
        variables: {
          studentId: id.dataItem.id,
        },
      })
      .subscribe(() => {
        this.items = this.items.filter((i) => i.id !== id.dataItem.id);
      });
  }

  public submitForm(): void {
    console.log(this.form.value.dateofbirth);
    if (this.update) {
      this.apollo
        .mutate({
          mutation: UPDATE_STUDENT,
          variables: {
            id: this.id,
            name: this.form.value.name,
            email: this.form.value.email,
            dateofbirth: this.form.value.dateofbirth,
          },
        })
        .subscribe((data: any) => {
          let index = this.items.findIndex((data) => data.id === this.id);
          let up = {
            ...this.items[index],
            age: data.data.updateStudent.age,
            name: data.data.updateStudent.name,
            email: data.data.updateStudent.email,
            dateofbirth: data.data.updateStudent.dateofbirth,
            id: this.id,
          };
          this.items = [
            ...this.items.slice(0, index),
            up,
            ...this.items.slice(index + 1),
          ];

          console.log('i___', index);
        });

      this.close();
    } else {
      this.apollo
        .mutate({
          mutation: CREATE_STUDENT,
          variables: {
            name: this.form.value.name,
            email: this.form.value.email,
            dateofbirth: this.form.value.dateofbirth,
          },
        })
        .subscribe((data: any) => {
          this.items = [...this.items, data.data.createStudent];
          console.log('------A', this.items);
        });
      this.close();
    }
  }

  public clearForm(): void {
    this.form.reset();
  }
  public editHandler(data: any) {
    this.update = true;
    let d = new Date(data.dataItem.dateofbirth.split('T')[0]);
    this.form = new FormGroup({
      name: new FormControl(data.dataItem.name, [Validators.required]),
      email: new FormControl(data.dataItem.email, [Validators.required]),
      dateofbirth: new FormControl(d, [Validators.required]),
    });
    this.id = data.dataItem.id;
    console.log(d);

    //    this.form = createFormGroup(dataItem);

    //  this.editedRowIndex = rowIndex;

    //sender.editRow(rowIndex, this.formGroup);
  }

  editHandler1(data: any) {
    console.log('data', data);
    this.update = true;
    this.editRow = new FormGroup({
      name: new FormControl(data.dataItem.name),
      email: new FormControl(data.dataItem.email),
      dob: new FormControl(
        data.dataItem.dateofbirth,
        Validators.compose([Validators.pattern('yyyy/MM/dd')])
      ),
    });
    this.editedRowIndex = data.rowIndex;
    data.sender.editRow(data.rowIndex, this.editRow);
    console.log(this.editRow);
  }

  saveHandler(data: any) {
    console.log(data);
    this.apollo
      .mutate({
        mutation: UPDATE_STUDENT,
        variables: {
          studentId: data.dataItem.id,
          names: data.formGroup.value.name,
          email: data.formGroup.value.email,
          dateofbirth: data.formGroup.value.dob,
        },
        refetchQueries: [
          {
            query: GET_STUDENTS,
          },
        ],
      })
      .subscribe(() => {});
    // .subscribe()
    data.sender.closeRow(data.rowIndex);
  }
}
