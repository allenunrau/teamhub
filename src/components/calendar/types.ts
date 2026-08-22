export type Member = { id: string; name: string };

export type EventItemData = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  assignedTo: Member | null;
};

export type CalendarEventData = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  createdBy: Member | null;
  items: EventItemData[];
};
