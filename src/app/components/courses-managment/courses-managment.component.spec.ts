import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesManagmentComponent } from './courses-managment.component';

describe('ManagmentComponent', () => {
  let component: CoursesManagmentComponent;
  let fixture: ComponentFixture<CoursesManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
