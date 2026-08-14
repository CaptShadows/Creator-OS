"use client";import{ConfirmDeleteDialog}from"./confirm-delete-dialog";

export function CampaignDeleteDialog({ campaignId, campaignName, action }: { campaignId: string; campaignName: string; action: (formData: FormData) => void | Promise<void> }) {
  return <ConfirmDeleteDialog id={campaignId} name={campaignName} entity="campaign" inputName="campaignId" action={action} warning="Campaigns containing operational, financial, linked, or attachment records are protected and must be archived instead."/>;
}
