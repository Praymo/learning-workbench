import { exponentialLogTopics } from "@/lib/exponentialLogTopics";
import { functionTopics } from "@/lib/functionTopics";
import { probabilityTopics } from "@/lib/probabilityTopics";
import { setsLogicTopics } from "@/lib/setsLogicTopics";
import { statisticsTopics } from "@/lib/statisticsTopics";
import { trigonometryTopics } from "@/lib/trigonometryTopics";
import { vectorTopics } from "@/lib/vectorTopics";

export const topicLessonCatalog = {
  "三角函数": trigonometryTopics,
  "函数概念与性质": functionTopics,
  "集合与常用逻辑用语": setsLogicTopics,
  "指数函数与对数函数": exponentialLogTopics,
  "平面向量": vectorTopics,
  "概率": probabilityTopics,
  "统计": statisticsTopics,
} as const;

export type LessonCatalogName = keyof typeof topicLessonCatalog;

export function getTopicLessons(knowledgePoint: string) {
  return topicLessonCatalog[knowledgePoint as LessonCatalogName];
}
