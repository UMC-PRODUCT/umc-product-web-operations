import type { Notice } from "./types"

const SAMPLE_TITLE =
  "제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목제목"

const SAMPLE_TARGET = "11기 · 중앙대 · Web"

export const MOCK_NOTICES: Notice[] = [
  {
    id: "1",
    required: true,
    title: SAMPLE_TITLE,
    audience: "challenger",
    target: SAMPLE_TARGET,
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 59121,
  },
  {
    id: "2",
    required: true,
    title: SAMPLE_TITLE,
    audience: "challenger",
    target: SAMPLE_TARGET,
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 59121,
  },
  {
    id: "3",
    required: true,
    title: SAMPLE_TITLE,
    audience: "challenger",
    target: SAMPLE_TARGET,
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 59121,
  },
  {
    id: "4",
    required: false,
    title: SAMPLE_TITLE,
    audience: "challenger",
    target: SAMPLE_TARGET,
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 59121,
  },
  {
    id: "5",
    required: false,
    title: SAMPLE_TITLE,
    audience: "challenger",
    target: SAMPLE_TARGET,
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 59121,
  },
  {
    id: "6",
    required: false,
    title: SAMPLE_TITLE,
    audience: "challenger",
    target: SAMPLE_TARGET,
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 59121,
  },
  {
    id: "7",
    required: true,
    title: SAMPLE_TITLE,
    audience: "challenger",
    target: SAMPLE_TARGET,
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 59121,
  },
  {
    id: "s1",
    required: true,
    title: SAMPLE_TITLE,
    audience: "staff",
    target: "11기 · 중앙 · Web",
    author: "중앙 운영국",
    createdAt: "26/10/06",
    views: 1280,
  },
]
