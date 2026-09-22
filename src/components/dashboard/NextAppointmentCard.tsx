import React from "react";
import { Appointment, PageView } from "../../types";
import { Card } from "../ui/Card";
import { CardHeading } from "../ui/Typography";
import { Calendar, ChevronRight, Stethoscope, MapPin } from "lucide-react";

interface NextAppointmentCardProps {
  appointment?: Appointment;
  onNavigate: (page: PageView) => void;
  t: (key: string, options?: any) => string;
}

export const NextAppointmentCard: React.FC<NextAppointmentCardProps> = ({
  appointment,
  onNavigate,
  t,
}) => {
  const doctorName = appointment?.doctorName || "Dr. Ananya Sharma, MD";
  const appointmentDate = appointment?.appointmentDate || "Tomorrow";
  const time = appointment?.time || "10:30 AM";
  const hospital = appointment?.hospitalName || "Apollo Cradle Maternity";

  return (
    <Card
      variant="glass"
      radius="3xl"
      isHoverable
      onClick={() => onNavigate("medical-timeline")}
      className="p-5 space-y-3.5 group cursor-pointer"
    >
      <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-rose-300/60 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>{t("nextCheckup")}</span>
        </span>
        <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-rose-200 dark:group-hover:bg-rose-900 transition-colors">
          <Stethoscope className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <CardHeading className="text-sm sm:text-base">
            {doctorName}
          </CardHeading>

          <div className="text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{appointmentDate} • {time}</span>
          </div>

          {hospital && (
            <div className="text-[11px] text-gray-500 dark:text-rose-300/70 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="truncate">{hospital}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
