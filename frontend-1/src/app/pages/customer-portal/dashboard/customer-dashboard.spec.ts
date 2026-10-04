import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CustomerDashboard } from './dashboard';

describe('CustomerDashboard', () => {
  let component: CustomerDashboard;
  let fixture: ComponentFixture<CustomerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDashboard);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with one assistant message', () => {
    expect(component.messages.length).toBe(1);

    expect(component.messages[0].sender).toBe('assistant');

    expect(component.messages[0].text).toContain(
      'AI Support Assistant',
    );
  });

  it('should start with an empty message composer', () => {
    expect(component.messageText).toBe('');
  });

  it('should initialize the message counter at one', () => {
    expect(component.messageCounter).toBe(1);
  });

  it('should contain the expected quick prompts', () => {
    expect(component.quickPrompts.length).toBe(4);

    expect(component.quickPrompts).toContain(
      "I can't log in to my account",
    );

    expect(component.quickPrompts).toContain(
      'I have a billing problem',
    );

    expect(component.quickPrompts).toContain(
      'My account is locked',
    );

    expect(component.quickPrompts).toContain(
      'I need help with something else',
    );
  });

  it('should select a quick prompt', () => {
    const prompt = "I can't log in to my account";

    component.selectQuickPrompt(prompt);

    expect(component.messageText).toBe(prompt);
  });

  it('should trim and send a customer message', () => {
    component.messageText = '  I need help with my account  ';

    component.sendMessage();

    expect(component.messages.length).toBe(2);

    expect(component.messages[1].sender).toBe('customer');

    expect(component.messages[1].text).toBe(
      'I need help with my account',
    );
  });

  it('should clear the composer after sending a message', () => {
    component.messageText = 'I need help';

    component.sendMessage();

    expect(component.messageText).toBe('');
  });

  it('should not send an empty message', () => {
    component.messageText = '';

    component.sendMessage();

    expect(component.messages.length).toBe(1);
    expect(component.messageCounter).toBe(1);
  });

  it('should not send a whitespace-only message', () => {
    component.messageText = '     ';

    component.sendMessage();

    expect(component.messages.length).toBe(1);
    expect(component.messageCounter).toBe(1);
  });

  it('should increment the message counter when a customer message is added', () => {
    component.messageText = 'Test message';

    component.sendMessage();

    expect(component.messageCounter).toBe(2);
    expect(component.messages[1].id).toBe(2);
  });

  it('should add an assistant message', () => {
    component.addAssistantMessage('Here is how you can solve the problem.');

    expect(component.messages.length).toBe(2);

    expect(component.messages[1].sender).toBe('assistant');

    expect(component.messages[1].text).toBe(
      'Here is how you can solve the problem.',
    );

    expect(component.messages[1].id).toBe(2);
  });

  it('should add a ticket-created system message', () => {
    component.addTicketCreatedMessage(42);

    expect(component.messages.length).toBe(2);

    expect(component.messages[1].sender).toBe('system');

    expect(component.messages[1].text).toBe(
      'Support ticket #42 has been created successfully.',
    );

    expect(component.messages[1].id).toBe(2);
  });

  it('should increment the counter when assistant and system messages are added', () => {
    component.addAssistantMessage('Assistant reply');
    component.addTicketCreatedMessage(15);

    expect(component.messageCounter).toBe(3);
    expect(component.messages.length).toBe(3);

    expect(component.messages[1].id).toBe(2);
    expect(component.messages[2].id).toBe(3);
  });

  it('should send a message when Enter is pressed', () => {
    component.messageText = 'I need support';

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: false,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    component.handleEnter(event);

    expect(preventDefaultSpy).toHaveBeenCalled();

    expect(component.messages.length).toBe(2);

    expect(component.messages[1].sender).toBe('customer');

    expect(component.messages[1].text).toBe('I need support');

    expect(component.messageText).toBe('');
  });

  it('should not send a message when Shift + Enter is pressed', () => {
    component.messageText = 'I need a new line';

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    component.handleEnter(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();

    expect(component.messages.length).toBe(1);

    expect(component.messageText).toBe('I need a new line');
  });

  it('should render the initial assistant message', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('AI Support Assistant');

    expect(text).toContain(
      "Tell me what problem you're experiencing",
    );
  });

  it('should render the quick help section initially', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Common topics');

    const buttons = element.querySelectorAll('.quick-action');

    expect(buttons.length).toBe(4);
  });

  it('should update the composer when a quick prompt is clicked', () => {
    const button =
      fixture.nativeElement.querySelector(
        '.quick-action',
      ) as HTMLButtonElement;

    button.click();

    fixture.detectChanges();

    expect(component.messageText).toBe(
      "I can't log in to my account",
    );
  });

  it('should disable the send button when the composer is empty', () => {
    component.messageText = '';

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        '.send-button',
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should enable the send button when the composer contains text', () => {
    component.messageText = 'I need help';

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        '.send-button',
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(false);
  });

  it('should disable the send button for whitespace-only input', () => {
    component.messageText = '     ';

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        '.send-button',
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should hide quick help after the customer sends a message', () => {
    component.messageText = 'I need help';

    component.sendMessage();

    fixture.detectChanges();

    const quickHelp =
      fixture.nativeElement.querySelector('.quick-help');

    expect(quickHelp).toBeNull();
  });

  it('should render a customer message after sending it', () => {
    component.messageText = 'My account is locked';

    component.sendMessage();

    fixture.detectChanges();

    const customerMessage =
      fixture.nativeElement.querySelector(
        '.customer-message',
      ) as HTMLElement;

    expect(customerMessage).toBeTruthy();

    expect(customerMessage.textContent).toContain(
      'My account is locked',
    );

    expect(customerMessage.textContent).toContain('You');
  });

  it('should render assistant messages correctly', () => {
    component.addAssistantMessage(
      'Please check your account settings.',
    );

    fixture.detectChanges();

    const assistantMessages =
      fixture.nativeElement.querySelectorAll(
        '.assistant-message',
      );

    expect(assistantMessages.length).toBe(2);

    expect(
      assistantMessages[1].textContent,
    ).toContain(
      'Please check your account settings.',
    );
  });

  it('should render ticket-created messages as system messages', () => {
    component.addTicketCreatedMessage(99);

    fixture.detectChanges();

    const systemMessage =
      fixture.nativeElement.querySelector(
        '.system-message',
      ) as HTMLElement;

    expect(systemMessage).toBeTruthy();

    expect(systemMessage.textContent).toContain(
      'Support ticket #99 has been created successfully.',
    );
  });
});
