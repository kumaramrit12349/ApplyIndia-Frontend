import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export interface ITestSeries {
  pk?: string;
  sk?: string;
  exam_tag: string;
  title_en: string;
  title_hi?: string;
  description_en?: string;
  description_hi?: string;
  is_published: boolean;
  created_at?: number;
  modified_at?: number;
}

export const fetchAllTestSeries = () =>
  privateFetch<{ success: boolean; results: ITestSeries[] }>(PRIVATE_API.TEST_SERIES_ADMIN.LIST);

export const createTestSeries = (input: Pick<ITestSeries, "exam_tag" | "title_en" | "title_hi" | "description_en" | "description_hi">) =>
  privateFetch<{ success: boolean; data: ITestSeries }>(PRIVATE_API.TEST_SERIES_ADMIN.CREATE, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateTestSeries = (id: string, updates: Partial<ITestSeries>) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.TEST_SERIES_ADMIN.UPDATE(id), {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

export const publishTestSeries = (id: string, is_published: boolean) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.TEST_SERIES_ADMIN.PUBLISH(id), {
    method: "PATCH",
    body: JSON.stringify({ is_published }),
  });

export const deleteTestSeries = (id: string) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.TEST_SERIES_ADMIN.DELETE(id), { method: "DELETE" });
