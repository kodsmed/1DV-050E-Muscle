export type PTInvite = {
  id: number;
  invite_hash: string;
  owner_uuid: string;
  created_at: Date;
};

export type InviteResult = {
  success: boolean;
  expired: boolean;
  message: string;
};