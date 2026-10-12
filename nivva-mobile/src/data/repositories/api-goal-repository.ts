import { apiRequest, type ApiClient } from "@/data/api/api-client";
import type {
  ApiContributeGoalResponse,
  ApiContributionResponse,
  ApiGoalResponse,
} from "@/data/api/api-goal";
import {
  mapApiContributionToDomain,
  mapApiGoalToSnapshot,
  mapContributionInputToApiRequest,
  mapGoalInputToApiRequest,
} from "@/data/api/map-goal";
import type { GoalEditInput, NewGoalInput } from "@/domain/models";

import type { ContributeGoalInput, GoalRepository } from "./goal-repository";

const GOALS_PATH = "/api/v1/goals";

export function createApiGoalRepository(client: ApiClient = { request: apiRequest }): GoalRepository {
  return {
    async list() {
      const payload = await client.request<ApiGoalResponse[]>(GOALS_PATH);
      return payload.map((goal) => mapApiGoalToSnapshot(goal));
    },

    async get(id) {
      const [goal, contributions] = await Promise.all([
        client.request<ApiGoalResponse>(`${GOALS_PATH}/${id}`),
        client.request<ApiContributionResponse[]>(`${GOALS_PATH}/${id}/contributions`),
      ]);
      return mapApiGoalToSnapshot(goal, contributions.map(mapApiContributionToDomain));
    },

    async create(input: NewGoalInput) {
      const payload = await client.request<ApiGoalResponse>(GOALS_PATH, {
        method: "POST",
        body: mapGoalInputToApiRequest(input),
      });
      return mapApiGoalToSnapshot(payload);
    },

    async update(id, input: GoalEditInput) {
      const payload = await client.request<ApiGoalResponse>(`${GOALS_PATH}/${id}`, {
        method: "PUT",
        body: mapGoalInputToApiRequest(input),
      });
      return mapApiGoalToSnapshot(payload);
    },

    async remove(id) {
      await client.request<void>(`${GOALS_PATH}/${id}`, { method: "DELETE" });
    },

    async listContributions(goalId) {
      const payload = await client.request<ApiContributionResponse[]>(`${GOALS_PATH}/${goalId}/contributions`);
      return payload.map(mapApiContributionToDomain);
    },

    async contribute(goalId, input: ContributeGoalInput) {
      const payload = await client.request<ApiContributeGoalResponse>(`${GOALS_PATH}/${goalId}/contributions`, {
        method: "POST",
        body: mapContributionInputToApiRequest(input),
      });
      const contribution = mapApiContributionToDomain(payload.contribution);
      return {
        contribution,
        snapshot: mapApiGoalToSnapshot(payload.goal, [contribution]),
      };
    },
  };
}
