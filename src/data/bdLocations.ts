import type { BloodGroup } from '../types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export interface DivisionNode {
  division: string;
  districts: {
    district: string;
    upazilas: string[];
  }[];
}

export const BD_LOCATIONS: DivisionNode[] = [
  {
    division: 'ঢাকা',
    districts: [
      { district: 'ঢাকা', upazilas: ['ধানমন্ডি', 'মিরপুর', 'উত্তরা', 'গুলশান', 'মোহাম্মদপুর', 'মতিঝিল', 'সাভার', 'কেরানীগঞ্জ'] },
      { district: 'গাজীপুর', upazilas: ['গাজীপুর সদর', 'টঙ্গী', 'কালিয়াকৈর', 'শ্রীপুর', 'কাপাসিয়া'] },
      { district: 'নারায়ণগঞ্জ', upazilas: ['নারায়ণগঞ্জ সদর', 'ফতুল্লা', 'সিদ্ধিরগঞ্জ', 'সোনারগাঁও', 'রূপগঞ্জ'] },
      { district: 'টাঙ্গাইল', upazilas: ['টাঙ্গাইল সদর', 'মির্জাপুর', 'মধুপুর', 'কালিহাতী'] },
      { district: 'নরসিংদী', upazilas: ['নরসিংদী সদর', 'পলাশ', 'শিবপুর', 'বেলাবো'] }
    ]
  },
  {
    division: 'চট্টগ্রাম',
    districts: [
      { district: 'চট্টগ্রাম', upazilas: ['চট্টগ্রাম সদর', 'হাটহাজারী', 'পটিয়া', 'সীতাকুণ্ড', 'মিরসরাই', 'রাউজান', 'বোয়ালখালী', 'আনোয়ারা'] },
      { district: 'কক্সবাজার', upazilas: ['কক্সবাজার সদর', 'চকরিয়া', 'টেকনাফ', 'উখিয়া', 'রামু'] },
      { district: 'কুমিল্লা', upazilas: ['কুমিল্লা সদর', 'দাউদকান্দি', 'লাকসাম', 'চৌদ্দগ্রাম', 'দেবিদ্বার'] },
      { district: 'নোয়াখালী', upazilas: ['নোয়াখালী সদর', 'বেগমগঞ্জ', 'চাটখিল', 'কোম্পানীগঞ্জ'] },
      { district: 'ফেনী', upazilas: ['ফেনী সদর', 'ছাগলনাইয়া', 'দাগনভূঞা', 'সোনাগাজী'] }
    ]
  },
  {
    division: 'রাজশাহী',
    districts: [
      { district: 'রাজশাহী', upazilas: ['বোয়ালিয়া', 'মতিহার', 'পবা', 'গোদাগাড়ী', 'বাঘা'] },
      { district: 'বগুড়া', upazilas: ['বগুড়া সদর', 'শেরপুর', 'শিবগঞ্জ', 'সোনাতলা'] },
      { district: 'পাবনা', upazilas: ['পাবনা সদর', 'ঈশ্বরদী', 'সাঁথিয়া', 'বেড়া'] },
      { district: 'সিরাজগঞ্জ', upazilas: ['সিরাজগঞ্জ সদর', 'উল্লাপাড়া', 'শাহজাদপুর', 'কাজিপুর'] }
    ]
  },
  {
    division: 'খুলনা',
    districts: [
      { district: 'খুলনা', upazilas: ['খুলনা সদর', 'সোনাডাঙ্গা', 'দৌলতপুর', 'ডুমুরিয়া', 'রূপসা'] },
      { district: 'যশোর', upazilas: ['যশোর সদর', 'বেনাপোল', 'ঝিকরগাছা', 'অভয়নগর'] },
      { district: 'সাতক্ষীরা', upazilas: ['সাতক্ষীরা সদর', 'তালা', 'কলারোয়া', 'শ্যামনগর'] },
      { district: 'কুষ্টিয়া', upazilas: ['কুষ্টিয়া সদর', 'কুমারখালী', 'ভেড়ামারা', 'মিরপুর'] }
    ]
  },
  {
    division: 'সিলেট',
    districts: [
      { district: 'সিলেট', upazilas: ['সিলেট সদর', 'বিয়ানীবাজার', 'গোলাপগঞ্জ', 'বিশ্বনাথ', 'জৈন্তাপুর'] },
      { district: 'মৌলভীবাজার', upazilas: ['মৌলভীবাজার সদর', 'শ্রীমঙ্গল', 'কুলাউড়া', 'বড়লেখা'] },
      { district: 'হবিগঞ্জ', upazilas: ['হবিগঞ্জ সদর', 'মাধবপুর', 'নবীগঞ্জ', 'চুনারুঘাট'] },
      { district: 'সুনামগঞ্জ', upazilas: ['সুনামগঞ্জ সদর', 'ছাতক', 'জগন্নাথপুর', 'দিরাই'] }
    ]
  },
  {
    division: 'বরিশাল',
    districts: [
      { district: 'বরিশাল', upazilas: ['বরিশাল সদর', 'বাকেরগঞ্জ', 'গৌরনদী', 'উজিরপুর'] },
      { district: 'পটুয়াখালী', upazilas: ['পটুয়াখালী সদর', 'কলাপাড়া', 'গলাচিপা', 'বাউফল'] },
      { district: 'ভোলা', upazilas: ['ভোলা সদর', 'চরফ্যাশন', 'লালমোহন', 'বোরহানউদ্দিন'] }
    ]
  },
  {
    division: 'রংপুর',
    districts: [
      { district: 'রংপুর', upazilas: ['রংপুর সদর', 'মিঠাপুকুর', 'পীরগঞ্জ', 'বদরগঞ্জ'] },
      { district: 'দিনাজপুর', upazilas: ['দিনাজপুর সদর', 'পার্বতীপুর', 'বীরগঞ্জ', 'ফুলবাড়ী'] },
      { district: 'কুড়িগ্রাম', upazilas: ['কুড়িগ্রাম সদর', 'উলিপুর', 'নাগেশ্বরী', 'চিলমারী'] }
    ]
  },
  {
    division: 'ময়মনসিংহ',
    districts: [
      { district: 'ময়মনসিংহ', upazilas: ['ময়মনসিংহ সদর', 'ত্রিশাল', 'ভালুকা', 'মুক্তাগাছা', 'গফরগাঁও'] },
      { district: 'জামালপুর', upazilas: ['জামালপুর সদর', 'সরিষাবাড়ী', 'ইসলামপুর', 'মেলান্দহ'] },
      { district: 'নেত্রকোণা', upazilas: ['নেত্রকোণা সদর', 'কেন্দুয়া', 'মোহনগঞ্জ', 'দুর্গাপুর'] }
    ]
  }
];

export const BLOOD_COMPATIBILITY: Record<BloodGroup, { canDonateTo: BloodGroup[]; canReceiveFrom: BloodGroup[]; frequencyNote: string }> = {
  'O-': {
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    frequencyNote: 'সর্বজনীন দাতা (Universal Red Cell Donor)'
  },
  'O+': {
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
    frequencyNote: 'বাংলাদেশে সবচেয়ে বেশি চাহিদাসম্পন্ন গ্রুপ'
  },
  'A-': {
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
    frequencyNote: 'বিরল নেগেটিভ গ্রুপ'
  },
  'A+': {
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    frequencyNote: 'সাধারণ পজিটিভ গ্রুপ'
  },
  'B-': {
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
    frequencyNote: 'বিরল নেগেটিভ গ্রুপ'
  },
  'B+': {
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    frequencyNote: 'বাংলাদেশে অত্যন্ত প্রচলিত গ্রুপ'
  },
  'AB-': {
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    frequencyNote: 'সর্বজনীন প্লাজমা দাতা (বিরল)'
  },
  'AB+': {
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    frequencyNote: 'সর্বজনীন গ্রহীতা (Universal Recipient)'
  }
};
