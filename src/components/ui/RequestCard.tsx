import React from 'react';
import { Hospital, Calendar, Phone, AlertTriangle, Droplet } from 'lucide-react';
import { StaggerCard } from './MotionPrimitives';
import type { BloodRequest } from '../../types';

interface RequestCardProps {
  request: BloodRequest;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const isEmergency = request.urgency_level === 'Emergency';

  return (
    <StaggerCard
      className={`rounded-xl p-4 border transition-all flex flex-col justify-between gap-3 ${
        isEmergency
          ? 'bg-[#FFF1F3] border-[#B5122A]/45 shadow-sm'
          : 'bg-white border-[#E7E1E3] hover:border-[#B5122A]/40 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isEmergency && <AlertTriangle className="w-3.5 h-3.5 text-[#B5122A] shrink-0" />}
            <span className={isEmergency ? 'text-[#B5122A]' : 'text-[#75686C]'}>
              {request.urgency_level === 'Emergency'
                ? 'অতি জরুরি'
                : request.urgency_level === 'Urgent'
                ? 'জরুরি'
                : 'সাধারণ'}
            </span>
            <span aria-hidden="true" className="text-[#75686C]">·</span>
            <span className="text-[#75686C] tabular-nums">{request.units_required} ব্যাগ</span>
          </div>
          <h3 className="font-display text-base font-bold text-[#241A1D] truncate">
            {request.patient_name}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B5122A] text-white font-mono-num text-sm font-bold shrink-0">
          <Droplet className="w-3.5 h-3.5 fill-white" />
          {request.blood_group}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-[#241A1D]/80 pt-2 border-t border-[#E7E1E3]/70">
        <p className="flex items-center gap-1.5 truncate">
          <Hospital className="w-3.5 h-3.5 text-[#B5122A] shrink-0" />
          <span className="truncate">
            {request.hospital_name}
            {request.district ? `, ${request.district}` : ''}
          </span>
        </p>
        <p className="flex items-center gap-1.5 tabular-nums text-[#75686C]">
          <Calendar className="w-3.5 h-3.5 text-[#B5122A] shrink-0" />
          <span>
            {request.required_date || 'আজই প্রয়োজন'}
            {request.required_time ? ` · ${request.required_time}` : ''}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-xs font-medium text-[#75686C]">{request.admin_status}</span>
        <a
          href={`tel:${request.contact_phone}`}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-white bg-gradient-to-r from-[#7F1023] to-[#D61F3C] rounded-lg hover:brightness-110 transition-all whitespace-nowrap tabular-nums"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{request.contact_phone}</span>
        </a>
      </div>
    </StaggerCard>
  );
};
