import type { HTMLAttributes, ReactNode } from "react";

type AppLayoutProps = {
  header: ReactNode;
  left: ReactNode;
  right: ReactNode;
  miniPlayer: ReactNode;
  dropZone: ReactNode;
  toast: ReactNode;
  audio: ReactNode;
  dragHandlers: HTMLAttributes<HTMLDivElement>;
};

export function AppLayout({
  header,
  left,
  right,
  miniPlayer,
  dropZone,
  toast,
  audio,
  dragHandlers,
}: AppLayoutProps) {
  return (
    <div
      className="playlist-scrollbar relative z-10 h-screen overflow-y-auto overflow-x-hidden px-4 pb-32 pt-4 text-white sm:px-6 lg:px-8"
      {...dragHandlers}
    >
      {audio}
      {dropZone}
      {toast}
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-5">
        {header}
        <main className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.72fr)]">
          <section className="flex min-w-0 flex-col gap-5">{left}</section>
          <section className="min-h-0 min-w-0">{right}</section>
        </main>
      </div>
      {miniPlayer}
    </div>
  );
}
