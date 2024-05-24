export function useTimeslot(timeslot: number): string {
    const timeslotString = String(timeslot);

    if (timeslotString.length === 1) return `0${timeslotString}:00`;
    else return `${timeslotString}:00`;
}
