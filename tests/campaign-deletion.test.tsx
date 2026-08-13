import { cleanup,fireEvent,render,screen } from "@testing-library/react";
import { afterEach,describe,expect,it,vi } from "vitest";
import { CampaignDeleteDialog } from "@/components/campaign-delete-dialog";
import { campaignDeletionBlockers } from "@/lib/campaigns/deletion";
afterEach(cleanup);

describe("campaign permanent deletion",()=>{
  it("requires a first click before showing the irreversible confirmation",()=>{render(<CampaignDeleteDialog campaignId="11111111-1111-4111-8111-111111111111" campaignName="Mistake" action={vi.fn()}/>);expect(screen.queryByText("Confirm permanent deletion")).not.toBeInTheDocument();fireEvent.click(screen.getByText("Delete permanently"));expect(screen.getByRole("dialog")).toBeVisible();expect(screen.getByText("Confirm permanent deletion")).toBeVisible();});
  it("cancel closes the dialog without submitting",()=>{const action=vi.fn();render(<CampaignDeleteDialog campaignId="11111111-1111-4111-8111-111111111111" campaignName="Mistake" action={action}/>);fireEvent.click(screen.getByText("Delete permanently"));fireEvent.click(screen.getByText("Cancel"));expect(screen.queryByRole("dialog")).not.toBeInTheDocument();expect(action).not.toHaveBeenCalled();});
  it("explains every dependency that blocks destructive deletion",()=>{expect(campaignDeletionBlockers({deliverables:true,compensations:false,payments:true,contentLinks:true,samples:false,attachments:true})).toEqual(["deliverables","payment history","linked content","PDF attachments"]);});
  it("allows an empty mistaken campaign through the dependency gate",()=>{expect(campaignDeletionBlockers({deliverables:false,compensations:false,payments:false,contentLinks:false,samples:false,attachments:false})).toEqual([]);});
});
