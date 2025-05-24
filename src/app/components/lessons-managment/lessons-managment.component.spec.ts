import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsManagmentComponent } from './lessons-managment.component';

describe('LessonsManagmentComponent', () => {
  let component: LessonsManagmentComponent;
  let fixture: ComponentFixture<LessonsManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonsManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonsManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
