import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiMonitoring } from './ai-monitoring';

describe('AiMonitoring', () => {
  let component: AiMonitoring;
  let fixture: ComponentFixture<AiMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiMonitoring],
    }).compileComponents();

    fixture = TestBed.createComponent(AiMonitoring);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
