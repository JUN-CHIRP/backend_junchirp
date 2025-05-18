import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Guild, ChannelType } from 'discord.js';
import { Project } from '@prisma/client';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;

  private guild: Guild;

  public async onModuleInit(): Promise<void> {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    await this.client.login(process.env.DISCORD_BOT_TOKEN);

    this.client.once('ready', async () => {
      this.guild = await this.client.guilds.fetch(
        process.env.DISCORD_GUILD_ID as string,
      );
      await this.guild.roles.fetch();
      await this.guild.channels.fetch();
    });
  }

  public async createProjectChannel(
    projectName: string,
  ): Promise<{ channelId: string; adminRoleId: string; memberRoleId: string }> {
    const adminRole = await this.guild.roles.create({
      name: `${projectName}_admin`,
      permissions: [
        'ViewChannel',
        'SendMessages',
        'ManageMessages',
        'MentionEveryone',
        'AddReactions',
        'EmbedLinks',
        'AttachFiles',
        'UseExternalEmojis',
        'ReadMessageHistory',
        'ManageThreads',
        'SendMessagesInThreads',
        'UseApplicationCommands',
      ],
    });

    const memberRole = await this.guild.roles.create({
      name: `${projectName}_member`,
      permissions: [
        'ViewChannel',
        'SendMessages',
        'AddReactions',
        'EmbedLinks',
        'AttachFiles',
        'UseExternalEmojis',
        'ReadMessageHistory',
        'SendMessagesInThreads',
        'UseApplicationCommands',
      ],
    });

    const botRole = this.guild.roles.cache.find(
      (role) => role.name === 'JunChirp',
    );
    if (!botRole) {
      throw new Error('Bot role "JunChirp" not found');
    }

    const channel = await this.guild.channels.create({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: this.guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: adminRole.id,
        },
        {
          id: memberRole.id,
        },
        {
          id: botRole.id,
          allow: [
            'ViewChannel',
            'ManageRoles',
            'ManageChannels',
            'CreateInstantInvite',
          ],
        },
      ],
    });

    return {
      channelId: channel.id,
      adminRoleId: adminRole.id,
      memberRoleId: memberRole.id,
    };
  }

  public async addRoleToUser(
    userDiscordId: string,
    roleId: string,
  ): Promise<void> {
    const member = await this.guild.members.fetch(userDiscordId);
    await member.roles.add(roleId);
  }

  public async removeRoleFromUser(
    userDiscordId: string,
    roleId: string,
  ): Promise<void> {
    const member = await this.guild.members.fetch(userDiscordId);
    await member.roles.remove(roleId);
  }

  public async deleteProjectChannel(project: Project): Promise<void> {
    if (!this.guild.client.readyAt) {
      await new Promise((resolve) => {
        this.guild.client.once('ready', resolve);
      });
    }

    const retryAsync = async <T>(
      fn: () => Promise<T>,
      retries = 3,
      delayMs = 1000,
    ): Promise<T | null> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const result = await fn();
          if (result) {
            return result;
          }
        } catch {
          // ignore error
        }
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
      return null;
    };

    const channel = await retryAsync(() =>
      this.guild.channels.fetch(project.discordChannelId),
    );
    if (!channel) {
      throw new Error('Channel not found');
    }
    await channel.delete();

    const adminRole = await retryAsync(() =>
      this.guild.roles.fetch(project.discordAdminRoleId),
    );
    if (adminRole) {
      await adminRole.delete();
    }

    const memberRole = await retryAsync(() =>
      this.guild.roles.fetch(project.discordMemberRoleId),
    );
    if (memberRole) {
      await memberRole.delete();
    }
  }
}
