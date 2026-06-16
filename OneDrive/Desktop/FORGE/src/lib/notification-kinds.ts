/**
 * Client-safe split of notification kinds into conversational "messages" vs
 * system "events". No server imports here (unlike notify.ts, which pulls in
 * nodemailer/prisma) so this can be imported from client components.
 *
 * - Messages = a person talking to you (mentor note, mentee reply, shared
 * resource, unlock request). These live in the Messages inbox + live toast.
 * - Events = the system telling you something happened (check-in submitted,
 * questions assigned, generic mentor action). These live in the bell.
 */
export const MESSAGE_KINDS = [
 "mentor-left-note",
 "mentor-shared-resource",
 "mentee-replied",
 "mentee-requested-unlock",
] as const;

export function isMessageKind(kind: string): boolean {
 return (MESSAGE_KINDS as readonly string[]).includes(kind);
}
