import { AnalyticsWrapper } from "@/components/AnalyticsWrapper";

jest.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));

it("drops signed outcome and review pages before analytics delivery", () => {
  const element = AnalyticsWrapper();
  const beforeSend = element.props.beforeSend;
  expect(beforeSend({ url: "https://brief-nach-berlin.de/rueckmeldung?a=ja&t=private-token" })).toBeNull();
  expect(beforeSend({ url: "https://brief-nach-berlin.de/feedback?t=private-token" })).toBeNull();
  const event = { url: "https://brief-nach-berlin.de/warum" };
  expect(beforeSend(event)).toEqual(event);
});
