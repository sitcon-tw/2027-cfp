import { Placeholder } from '@/components/placeholder'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { sessionTypes, type SessionType } from '@/lib/session-types'

/**
 * Session-type stack with a detail panel that follows the selection. The
 * stack and panel read as one shape: only the outer corners are `xl`.
 */
export function SessionTypeTabs() {
  return (
    <Tabs
      orientation="vertical"
      defaultValue={sessionTypes[0].id}
      className="w-full gap-5 max-md:flex-col"
    >
      <TabsList className="grow basis-111.25 gap-5">
        {sessionTypes.map(({ id, title, summary, icon: Icon }) => (
          <TabsTab
            key={id}
            value={id}
            className="justify-start gap-2.5 px-5 py-4 text-left data-[orientation=vertical]:first:rounded-tr-sm data-[orientation=vertical]:last:rounded-br-sm"
          >
            <Icon className="mx-2.5 size-10 shrink-0" />
            <span className="flex flex-col p-2.5">
              <span className="text-h3 font-bold">{title}</span>
              <span className="text-paragraph font-normal">{summary}</span>
            </span>
          </TabsTab>
        ))}
      </TabsList>
      {sessionTypes.map((type) => (
        <TabsPanel
          key={type.id}
          value={type.id}
          className="flex grow basis-121.25"
        >
          <SessionTypeIntro type={type} />
        </TabsPanel>
      ))}
    </Tabs>
  )
}

function SessionTypeIntro({ type }: { type: SessionType }) {
  if (!type.intro) {
    return (
      <Placeholder
        label={`${type.title}介紹`}
        className="flex-1 rounded-r-xl"
      />
    )
  }

  return (
    <div className="relative isolate flex-1 overflow-clip rounded-sm rounded-r-xl px-5 py-3.75 text-foreground">
      <img
        src={type.intro.image}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/70 bg-linear-136 from-black/40 from-18% to-foreground/5 to-91%" />
      <div className="flex flex-col gap-2.5 px-5 py-2.5">
        <h3 className="text-h3 font-bold">{type.title}</h3>
        <p className="text-paragraph">{type.intro.description}</p>
      </div>
    </div>
  )
}
