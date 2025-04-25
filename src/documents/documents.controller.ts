import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  Put, HttpCode, HttpStatus,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Owner } from '../auth/decorators/owner.decorator';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader, ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { DocumentResponseDto } from './dto/document.response-dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';

@Controller('documents')
export class DocumentsController {
  public constructor(private documentsService: DocumentsService) {}

  @Owner('body', 'projectId')
  @ApiOperation({ summary: 'Add document' })
  @ApiCreatedResponse({ type: DocumentResponseDto })
  @ApiBadRequestResponse({
    description: 'Maximum number of documents per project is 20',
  })
  @ApiConflictResponse({ description: 'Duplicate document url' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @UsePipes(ValidationPipe)
  @Post('')
  public async addDocument(
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.addDocument(createDocumentDto);
  }

  @Owner('body', 'projectId')
  @ApiOperation({ summary: 'Update document' })
  @ApiOkResponse({ type: DocumentResponseDto })
  @ApiNotFoundResponse({ description: 'Document not found' })
  @ApiConflictResponse({ description: 'Duplicate document url' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @Put(':id')
  public async updateDocument(
    @Param('id', ParseUUIDv4Pipe) id: string,
    @Body(ValidationPipe) updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.updateDocument(id, updateDocumentDto);
  }

  @Owner('params', 'projectId')
  @ApiOperation({ summary: 'Delete document' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Document not found' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':projectId/:id')
  public async deleteProjectRole(
    @Param('projectId', ParseUUIDv4Pipe) _projectId: string,
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.documentsService.deleteDocument(id);
  }
}
