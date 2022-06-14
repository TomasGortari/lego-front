import { PartialItem } from '@directus/sdk';
import { Stack, Badge } from '@chakra-ui/react';
import { ITag } from '../../@types/tag';

const Tags = (props: { tags: string[] }) => {
  return (
    <Stack
      alignItems="flex-end"
      flexDirection="row"
      flexWrap="wrap"
      gap={3}
      my={3}
    >
      {props.tags?.map((tag, key) => (
        <Badge
          cursor="pointer"
          ml={2}
          borderRadius="2xl"
          w="min-content"
          p={2}
          key={key}
          color="white"
          bgColor="black"
        >
          {tag}
        </Badge>
      ))}
    </Stack>
  );
};

export default Tags;
